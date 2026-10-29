// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { JSONSchema7 } from '@rero/ng-core';

/**
 * Initialize the Formly widget on JSONSchema
 * @param schema - object, the JSONSchema
 */
function createWidgetFormlyConfigProps(schema: JSONSchema7): void {
  if (!schema.widget) {
    schema.widget = {};
  }
  if (!schema.widget.formlyConfig) {
    schema.widget.formlyConfig = {};
  }
  if (!schema.widget.formlyConfig.props) {
    schema.widget.formlyConfig.props = {};
  }
}

/**
 * Resolve $ref definition and set properties on field
 * @param schema - json schema all properties
 * @param schemaProperties - json schema level
 * @returns the updated schema
 */
export function resolve$ref(schema: JSONSchema7, schemaProperties: any): JSONSchema7 {
  if (schemaProperties) {
    Object.keys(schemaProperties).forEach((property) => {
      const field = schemaProperties[property];
      if (field.properties) {
        resolve$ref(schema, field.properties);
      }
      // The field contains a $ref definition
      if (field.$ref) {
        const paths = field.$ref.replace('#/', '').split('/');
        let def: any = schema;
        paths.forEach((path: string) => {
          def = def[path];
        });
        // Populate field with new definition
        Object.keys(def).forEach((defKey: string) => {
          if (defKey === 'widget' && def[defKey].formlyConfig?.templateOptions) {
            def[defKey].formlyConfig.props = def[defKey].formlyConfig.templateOptions;
            delete def[defKey].formlyConfig.templateOptions;
          }
          field[defKey] = def[defKey];
        });
        // Delete reference
        delete field.$ref;
      }
    });
  }

  return schema;
}

/**
 * Process required properties on the JSONSchema.
 * @param schema - object, the JSONSchema
 * @returns object, a processed required properties JSONSchema
 */
function processRequiredJsonSchema(schema: JSONSchema7): JSONSchema7 {
  if (!schema.required || !schema.properties) {
    return schema;
  }
  const properties = schema.properties;
  schema.required.map((key: string) => {
    const childSchema = properties[key];
    if (childSchema && typeof childSchema !== 'boolean') {
      const child = childSchema as JSONSchema7;
      createWidgetFormlyConfigProps(child);
      child.widget.formlyConfig.props.initialRequired = true;
    }
  });

  return schema;
}

/**
 * Process order properties on the JSONSchema
 * @param schema - object, the JSONSchema
 * @returns object, a processed order properties JSONSchema
 */
function processPropertiesOder(schema: JSONSchema7): JSONSchema7 {
  const original = schema.properties!;
  schema.properties = Object.fromEntries(
    schema.propertiesOrder!.filter((p) => p in original).map((p) => [p, original[p]]),
  );
  return schema;
}

/**
 * Process JSONSchema
 * This re-order the object properties given a local defined
 * `propertiesOrder` property.
 * The process the required properties given a local defined
 * `required` property.
 * @param schema - object, the JSONSchema
 * @returns object, a converted JSONSchema
 */
export function processJsonSchema(schema: JSONSchema7): JSONSchema7 {
  if (schema.properties) {
    if (schema.propertiesOrder) {
      schema = processPropertiesOder(schema);
    }
    if (schema.required) {
      schema = processRequiredJsonSchema(schema);
    }
    // recursion for objects
    if (schema.properties) {
      for (const property of Object.keys(schema.properties)) {
        const prop = schema.properties[property];
        if (typeof prop === 'object' && prop !== null) {
          processJsonSchema(prop as JSONSchema7);
        }
      }
    }
  }
  // recursion for array
  if (schema.items) {
    if (typeof schema.items === 'object') {
      processJsonSchema(schema.items as JSONSchema7);
    }
  }
  // recursion for oneOf
  if (schema.oneOf) {
    for (const item of schema.oneOf) {
      if (typeof item === 'object' && item !== null) {
        processJsonSchema(item as JSONSchema7);
      }
    }
  }
  // recursion for anyOf
  if (schema.anyOf) {
    for (const item of schema.anyOf) {
      if (typeof item === 'object' && item !== null) {
        processJsonSchema(item as JSONSchema7);
      }
    }
  }
  // recursion for allOf
  if (schema.allOf) {
    for (const item of schema.allOf) {
      if (typeof item === 'object' && item !== null) {
        processJsonSchema(item as JSONSchema7);
      }
    }
  }
  // recursion for definitions
  if (schema.definitions) {
    for (const property of Object.keys(schema.definitions)) {
      const def = schema.definitions[property];
      if (typeof def === 'object' && def !== null) {
        processJsonSchema(def as JSONSchema7);
      }
    }
  }
  return schema;
}
