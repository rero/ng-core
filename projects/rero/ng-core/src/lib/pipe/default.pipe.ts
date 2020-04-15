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
 * Pipe for returning a default value if the given value is null or undefined.
 */
@Pipe({name: 'default', pure: true})
export class DefaultPipe implements PipeTransform {
  /**
   * Returns a default value.
   *
   * @param value Value to check.
   * @param defaultValue Value to return if value is null.
   * @return Value or default value.
   */
  transform(value: any, defaultValue: any): any {
    return value || defaultValue;
  }
}
