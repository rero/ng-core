// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Pipe, PipeTransform } from '@angular/core';
import { capitalize } from '../../utils/utils';

/**
 * Uppercase the first letter of the string.
 */
@Pipe({ name: 'ucfirst' })
export class UpperCaseFirstPipe implements PipeTransform {
  /**
   * Uppercase the first letter of the given value.
   *
   * @param value Value to transform.
   * @return Transformed value.
   */
  transform(value: string): string {
    if (!value) {
      return value;
    }

    return capitalize(value);
  }
}
