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
 * Get human readable file size.
 */
@Pipe({
  name: 'filesize'
})
export class FilesizePipe implements PipeTransform {
  /**
   * Transform size to a human readable size.
   *
   * @param size Size of file.
   * @param precision Number of decimals.
   * @return Human readable file size.
   */
  transform(size: number, precision = 2) {
    let i = -1;
    const byteUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        size /= 1024;
        i++;
    } while (size > 1024);

    return [Math.max(size, 0.1).toFixed(precision), byteUnits[i]].join(' ');
  }
}
