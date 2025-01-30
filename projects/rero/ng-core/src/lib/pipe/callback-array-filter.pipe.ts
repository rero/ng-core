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
 * Pipe for applying a callback function to filter array items.
 */
@Pipe({
  name: 'callbackArrayFilter'
})
export class CallbackArrayFilterPipe implements PipeTransform {
  /**
   * Filter array items with the given callback function.
   *
   * @param items List of items.
   * @param callback Callback function to apply.
   * @return List of filtered values.
   */
  transform(items?: any[], callback?: (item: any) => boolean): any[] {
    if (!items && !callback) {
      return [];
    }
    if (items && !callback) {
      return items;
    }

    return items.filter(item => callback(item));
  }
}
