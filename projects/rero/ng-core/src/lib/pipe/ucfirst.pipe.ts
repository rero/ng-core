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
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Uppercase the first letter of the string.
 */
@Pipe({
    name: 'ucfirst',
    standalone: false
})
export class UpperCaseFirstPipe implements PipeTransform {
  /**
   * Uppercase the first letter of the given value.
   *
   * @param value Value to transform.
   * @return Transformed value.
   */
  transform(value: string): string {
    if (value === null) {
      return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
