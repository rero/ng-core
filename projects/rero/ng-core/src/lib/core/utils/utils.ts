/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
    })
  ) as Partial<T>;
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function removeChars(value: string, chars: string[] = ['"']): string {
  const re = new RegExp('['+ chars.join('') +']', 'gi');
  return value.replace(re, '');
}
