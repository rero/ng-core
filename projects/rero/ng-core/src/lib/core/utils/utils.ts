// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
