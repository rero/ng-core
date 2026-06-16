// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe for truncating text.
 */
@Pipe({ name: 'truncateText' })
export class TruncateTextPipe implements PipeTransform {
  /**
   * Truncate text.
   *
   * @param value Text to truncate.
   * @param limit Limit after which the text is truncated.
   * @param trail Trailing chars
   * @param type Word or Char type
   * @return Truncated string
   */
  transform(value: string, limit = 40, trail = '…', type: 'word' | 'char' = 'word'): string {
    let result = value || '';

    if (type === 'char' && value) {
      if (value.length < limit) {
        return value;
      } else {
        return value.substring(0, limit) + trail;
      }
    }

    if (type === 'word' && value) {
      const words = value.split(/\s+/);
      if (words.length > Math.abs(limit)) {
        if (limit < 0) {
          limit *= -1;
          result = trail + words.slice(words.length - limit).join(' ');
        } else {
          result = words.slice(0, limit).join(' ') + trail;
        }
      }
    }

    return result;
  }
}
