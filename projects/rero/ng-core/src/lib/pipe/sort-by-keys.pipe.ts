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
 *
 * Source code: https://dev.to/codephobia/using-typescript-to-sort-by-keys-35ob
 */
import { Pipe, PipeTransform } from '@angular/core';
import { sortByKeys } from '../utils/sort-by-keys';

/**
 * Pipe for the sorting function.
 */
@Pipe({
    name: 'sortByKeys',
    pure: true
})
export class SortByKeysPipe implements PipeTransform {
  /**
   * Order elements by sort key(s)
   * @param value - array of values
   * @param keys - string, sort key
   */
  public transform(value: any, ...keys: string[]): any[] {
    return sortByKeys<any>(value, ...keys);
  }
}
