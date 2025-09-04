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
import { JSONSchema7 as JSONSchema7Base } from 'json-schema';
import { extractIdOnRef } from '../../utils/utils';

export interface WidgetConfig {
  formlyConfig?: {
    props?: Record<string, unknown>;
    templateOptions?: Record<string, unknown>;
  };
  [key: string]: unknown;
}
export interface JSONSchema7 extends JSONSchema7Base {
  widget: WidgetConfig;
}

/**
 * Initialize the Formly widget on JSONSchema
 * @param schema - object, the JSONSchema
 */
function createWidgetFormlyConfigProps(schema: JSONSchema7)  {
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
export function resolve$ref(
  schema: Record<string, unknown>,
  schemaProperties?: Record<string, JSONSchema7>
): Record<string, unknown> {
  if (schemaProperties) {
    Object.keys(schemaProperties).forEach((property: string) => {
      const field = schemaProperties[property];
      if (field.properties) {
        resolve$ref(schema, field.properties);
      }
      if (field.$ref) {
        const paths = field.$ref.replace('#/', '').split('/');
        let def: Record<string, unknown> = schema;
        paths.forEach((path: string) => {
          def = def[path] as Record<string, unknown>;
        });
        Object.keys(def).forEach((defKey: string) => {
          if (
            defKey === 'widget' &&
            (def[defKey] as JSONSchema7).formlyConfig?.templateOptions
          ) {
            ((def[defKey] as JSONSchema7).formlyConfig!.props =
              (def[defKey] as JSONSchema7).formlyConfig!.templateOptions);
            delete (def[defKey] as JSONSchema7).formlyConfig!.templateOptions;
          }
          (field as Record<string, unknown>)[defKey] = def[defKey];
        });
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
function processRequiredJsonSchema(
  schema: JSONSchema7 & { required?: string[]; properties: Record<string, JSONSchema7> }
): JSONSchema7 & { required?: string[]; properties: Record<string, JSONSchema7> } {
  schema.required?.forEach((key: string) => {
    const childSchema = schema.properties[key];
    if (childSchema) {
      createWidgetFormlyConfigProps(childSchema);
      childSchema.widget.formlyConfig!.props!.initialRequired = true;
    }
  });

  return schema;
}


/**
 * Process order properties on the JSONSchema
 * @param schema - object, the JSONSchema
 * @returns object, a processed order properties JSONSchema
 */
function processPropertiesOder(
  schema: JSONSchema7 & {
    propertiesOrder?: string[];
    _properties?: Record<string, JSONSchema7>;
  }
): JSONSchema7 & { propertiesOrder?: string[]; _properties?: Record<string, JSONSchema7> } {
  // copy the data
  schema._properties = { ...schema.properties };
  // new ordered properties
  schema.properties = {};
  // copy in the right order
  if (schema.propertiesOrder) {
    for (const property of schema.propertiesOrder) {
      schema.properties[property] = schema._properties[property];
    }
  }

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
export function processJsonSchema(
  schema: JSONSchema7 & {
    properties?: Record<string, JSONSchema7>;
    propertiesOrder?: string[];
    required?: string[];
    items?: JSONSchema7;
    oneOf?: JSONSchema7[];
    anyOf?: JSONSchema7[];
    allOf?: JSONSchema7[];
    definitions?: Record<string, JSONSchema7>;
  }
): JSONSchema7 & {
  properties?: Record<string, JSONSchema7>;
  propertiesOrder?: string[];
  required?: string[];
  items?: JSONSchema7;
  oneOf?: JSONSchema7[];
  anyOf?: JSONSchema7[];
  allOf?: JSONSchema7[];
  definitions?: Record<string, JSONSchema7>;
} {
  if (schema.properties) {
    if (schema.propertiesOrder) {
      schema = processPropertiesOder(schema);
    }
    if (schema.required) {
      schema = processRequiredJsonSchema(schema);
    }
    // recursion for objects
    for (const property of Object.keys(schema.properties)) {
      processJsonSchema(schema.properties[property]);
    }
  }

  if (schema.items) {
    processJsonSchema(schema.items);
  }

  if (schema.oneOf) {
    for (const item of schema.oneOf) {
      processJsonSchema(item);
    }
  }

  if (schema.anyOf) {
    for (const item of schema.anyOf) {
      processJsonSchema(item);
    }
  }

  if (schema.allOf) {
    for (const item of schema.allOf) {
      processJsonSchema(item);
    }
  }

  if (schema.definitions) {
    for (const property of Object.keys(schema.definitions)) {
      processJsonSchema(schema.definitions[property]);
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
export function resolveRefs(data: unknown): unknown {
  // array?
  if (Array.isArray(data)) {
    return data.map(d => resolveRefs(d));
  }

  // object
  if (data !== null && typeof data === 'object') {
    const newObject: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      const value = resolveRefs((data as Record<string, unknown>)[key]);
      if (key === '$ref') {
        newObject['pid'] = extractIdOnRef(value);
      } else {
        newObject[key] = value;
      }
    }
    return newObject;
  }

  // primitive (string, number, boolean, null, undefined)
  return data;
}


/**
 * Tell if a value can be considered as empty
 * @param value - any, the value to check
 * @returns boolean, true if the value is empty
 */
export function isEmpty(value: unknown): boolean {
  return (
    // null or undefined
    value == null ||
    // has length and it's zero (array, string)
    (typeof value === 'object' && value !== null && 'length' in value && (value as { length: number }).length === 0) ||
    // is an Object and has no keys
    (typeof value === 'object' && value !== null && !('length' in value) && Object.keys(value).length === 0)
  );
}


/**
 * Recursively remove the empty values
 * @param data - object, the data to be cleaned
 * @returns object, a fresh copy of the clean data
 */
export function removeEmptyValues(data: unknown): unknown {
  // array?
  if (Array.isArray(data)) {
    const newArray: unknown[] = [];
    for (const d of data) {
      const value = removeEmptyValues(d);
      if (!isEmpty(value)) {
        newArray.push(value);
      }
    }
    return newArray;
  }

  // object?
  if (data !== null && typeof data === 'object') {
    const newObject: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      const value = removeEmptyValues((data as Record<string, unknown>)[key]);
      if (!isEmpty(value)) {
        newObject[key] = value;
      }
    }
    return newObject;
  }

  // primitive
  return data;
}

