// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { JsonObject, JsonValue } from '../../model';

export function extractIdOnRef(ref: string): string {
  if (!ref) {
    throw new Error('extractIdOnRef: ref is null or empty');
  }

  const match = /.*\/([^/]+)$/.exec(ref);

  if (!match) {
    throw new Error(`extractIdOnRef: unable to extract id from ref "${ref}"`);
  }

  return match[1];
}

export function cleanDictKeys<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (value == null) {
        return false;
      }

      if (typeof value === 'string' || Array.isArray(value)) {
        return value.length > 0;
      }

      return true;
    }),
  ) as Partial<T>;
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function removeChars(value: string, chars: string[] = ['"', '(', ')', '\\']): string {
  const escaped = chars.map((char) => char.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'));
  const re = new RegExp('[' + escaped.join('') + ']', 'gi');
  return value.replace(re, '');
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

/**
 * Replace $ref by pid
 *
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
