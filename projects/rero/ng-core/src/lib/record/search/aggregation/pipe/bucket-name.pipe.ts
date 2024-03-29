/*
 * RERO angular core
 * Copyright (C) 2019-2023 RERO
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
import { Observable, of } from 'rxjs';
import { BucketNameService } from '../service/bucket-name.service';

@Pipe({
  name: 'bucketName'
})
export class BucketNamePipe implements PipeTransform {

  /**
   * Transform value if the type of aggregation is language
   * @param value - aggregation value
   * @param aggregationKey - aggregation type
   * @returns Observable<string>
   */
  constructor(private bucketNameService: BucketNameService) {}
  transform(value: string, aggregationKey: string): Observable<string> {
    return this.bucketNameService.transform(aggregationKey, value);
  }
}
