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
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

/**
 * To implement your translation, please do it in your application
 * by overloading this service.
 * Example:
 *
 * import { BucketNameService as CoreBucketNameService } from '@rero/ng-core';
 * import { BucketNameService } from './service/bucket-name.service';
 *
 * @NgModule({
 *     providers: [
 *         { provide: CoreBucketNameService, useClass: BucketNameService }
 *     ]
 * });
 *
 */

@Injectable({
  providedIn: 'root'
})
export class BucketNameService {

  /**
   * Constructor
   * @param translateService - TranslateService
   */
  constructor(private translateService: TranslateService) {}

  /**
   * Transform aggregation name
   * @param aggregationKey - type of aggregation
   * @param value - value of current aggregation
   * @returns Observable of string
   */
  transform(aggregationKey: string, value: string): Observable<string> {
    let data = value;
    // Legacy: for compatibility
    switch (aggregationKey) {
      case 'language': data = `lang_${value}`; break;
    }
    // End Legacy
    return of(this.translateService.instant(data));
  }
}

export interface IBucketNameService {
  transform(aggregationKey: string, value: string): Observable<string>;
}
