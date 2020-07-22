/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { extractIdOnRef } from '../../utils/utils';

/**
 * Fix order in JSONSchema
 * This re-order the object properties given a local defined
 * `propertiesOrder` property.
 * @param schema - object, the JSONSchema
 * @returns object, a fresh copy of the ordred JSONSchema
 */
export function orderedJsonSchema(schema: any) {
  if (schema.properties) {
    if (schema.propertiesOrder) {
      // copy the data
      schema._properties = { ...schema.properties };
      // new ordered properties
      schema.properties = {};
      // copy in the right order
      for (const property of schema.propertiesOrder) {
        schema.properties[property] = schema._properties[property];
      }
    }
    // recursion for objects
    for (const property of Object.keys(schema.properties)) {
      orderedJsonSchema(schema.properties[property]);
    }
  }
  // recursion for array
  if (schema.items) {
    orderedJsonSchema(schema.items);
  }
  // recursion for oneOf
  if (schema.oneOf) {
    for (const item of schema.oneOf) {
      orderedJsonSchema(item);
    }
  }
  // recursion for anyOf
  if (schema.anyOf) {
    for (const item of schema.anyOf) {
      orderedJsonSchema(item);
    }
  }
  // recursion for allOf
  if (schema.allOf) {
    for (const item of schema.allOf) {
      orderedJsonSchema(item);
    }
  }
  // recursion for definitions
  if (schema.definitions) {
    for (const property of Object.keys(schema.definitions)) {
      orderedJsonSchema(schema.definitions[property]);
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
export function resolveRefs(data: any) {
  // array?
  if (data instanceof Array) {
    for (const d of data) {
      // recursion
      const value = resolveRefs(d);
    }
  }
  // object
  if (data instanceof Object) {
    // new object with resolved refs
    const newObject: any = {};
    for (const key of Object.keys(data)) {
      const value = resolveRefs(data[key]);
      if (key === '$ref') {
        newObject.pid = extractIdOnRef(value);
      } else {
        newObject[key] = value;
      }
    }
    return newObject;
  }
  return data;
}


/**
 * Tell if a value can be considered as empty
 * @param value - any, the value to check
 * @returns boolean, true if the value is empty
 */
export function isEmpty(value: any) {
  return (
    // null or undefined
    value == null ||
    // has length and it's zero (array, string)
    (value.hasOwnProperty('length') && value.length === 0) ||
    // is an Object and has no keys
    (value instanceof Object && Object.keys(value).length === 0)
  );
}

/**
 * Recursively remove the empty values
 * @param data - object, the data to be cleaned
 * @returns object, a fresh copy of the clean data
 */
export function removeEmptyValues(data: any) {
  // array?
  if (data instanceof Array) {
    // new array with non empty values
    const newArray = [];
    for (const d of data) {
      // recursion
      const value = removeEmptyValues(d);
      if (!isEmpty(value)) {
        newArray.push(value);
      }
    }
    return newArray;
  }
  // object?
  if (data instanceof Object) {
    // new object with non empty values
    const newObject = {};
    for (const key of Object.keys(data)) {
      const value = removeEmptyValues(data[key]);
      if (!isEmpty(value)) {
        newObject[key] = value;
      }
    }
    return newObject;
  }
  return data;
}
