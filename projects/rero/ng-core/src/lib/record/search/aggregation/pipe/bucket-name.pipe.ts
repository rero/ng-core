/*
 * RERO angular core
 * Copyright (C) 2022 RERO
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

@Pipe({
  name: 'bucketName'
})
export class BucketNamePipe implements PipeTransform {

  /**
   * Tranform value if the type of aggregation is language
   * @param value - aggregation value
   * @param aggregationKey - aggregation type
   * @returns string
   */
  transform(value: string, aggregationKey: string): string {
    switch (aggregationKey) {
      case 'language': return `lang_${value}`;
      default: return value;
    }
  }
}
