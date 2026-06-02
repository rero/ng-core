/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { extractIdOnRef } from '../../../core/utils/utils';
import { JSONSchema7 as JSONSchema7Base } from 'json-schema';
import { JsonObject, JsonValue } from '../../../model';

export interface JSONSchema7 extends JSONSchema7Base {
  widget: Record<string, any>;
  propertiesOrder?: string[];
}

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

/**
 * Replace $ref by pid
 *
 * @param schema - object, the JSONSchema
 * @param data - object, the data to be cleaned
 * @returns object, a fresh copy of the data with replacements
 */
export function resolveRefs(data: JsonValue): JsonValue {
  if (Array.isArray(data)) {
    return data.map((d) => resolveRefs(d));
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data as JsonObject).map(([key, value]) => {
        const resolved = resolveRefs(value);
        return key === '$ref' ? ['pid', extractIdOnRef(resolved as string)] : [key, resolved];
      }),
    );
  }
  return data;
}

/**
 * Tell if a value can be considered as empty
 * @param value - any, the value to check
 * @returns boolean, true if the value is empty
 */
export function isEmpty(value: JsonValue): boolean {
  return (
    // null or undefined
    value == null ||
    // string or array with length zero
    (typeof value === 'string' && value.length === 0) ||
    (Array.isArray(value) && value.length === 0) ||
    // object with no keys
    (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
  );
}

/**
 * Recursively remove the empty values
 * @param data - object, the data to be cleaned
 * @returns object, a fresh copy of the clean data
 */
export function removeEmptyValues<TMetadata = JsonValue>(data: TMetadata): TMetadata {
  // array?
  if (Array.isArray(data)) {
    // new array with non empty values
    const newArray: TMetadata[] = [];
    data.forEach((d) => {
      const value = removeEmptyValues(d);
      if (!isEmpty(value)) {
        newArray.push(value);
      }
    });
    return newArray as TMetadata;
  }
  // object?
  if (typeof data === 'object' && data != null) {
    // new object with non empty values
    const newObject: JsonObject = {};
    const dataRecord = data as JsonObject;
    for (const key of Object.keys(dataRecord)) {
      const value = removeEmptyValues(dataRecord[key]);
      if (!isEmpty(value)) {
        newObject[key] = value;
      }
    }
    return newObject as TMetadata;
  }
  return data;
}
