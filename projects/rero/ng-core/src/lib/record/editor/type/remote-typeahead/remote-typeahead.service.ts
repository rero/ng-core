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

import { Injectable } from '@angular/core';
import { RecordService } from '../../../record.service';
import { map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { ApiService } from '../../../../api/api.service';
import { SuggestionMetadata } from './remote-typeahead.component';
import { Record } from '../../../record';

@Injectable({
  providedIn: 'root'
})
export class RemoteTypeaheadService {

  /** Constructor.
   * @param _recordService - RecordService
   * @param _apiService - APIService
   */
  constructor(
    protected _recordService: RecordService,
    protected _apiService: ApiService
  ) { }

  /**
   * Convert the input value (i.e. $ref url) into a template html code.
   * @param options - remote typeahead options
   * @param value - formControl value i.e. $ref value
   * @returns Observable of string - html template representation of the value.
   */
  getValueAsHTML(options, value: string): Observable<string> {
    const url = value.split('/');
    const pid = url.pop();
    return this._recordService
      .getRecord(options.type, pid, 1)
      .pipe(
        map(result => {
          return result.metadata[options.field];
        }),
        map(v => `<strong>${v}</strong>`)
      );
  }

  /**
   * Enable/disable the group field functionality in the ngx-bootstrap typeahead.
   * @param options - remote typeahead options
   * @returns true if the group field typeahead should be enabled
   */
  enableGroupField(options: any): boolean {
    return options.enableGroupField;
  }

  /**
   * Get the suggestions list given a search query.
   * @param options - remote typeahead options
   * @param query - search query to retrieve the suggestions list
   * @param numberOfSuggestions - the max number of suggestion to return
   * @returns - an observable of the list of suggestions.
   */
  getSuggestions(options: any, query: string, numberOfSuggestions: number): Observable<Array<SuggestionMetadata>> {
    if (!query) {
      return of([]);
    }
    return this._recordService
      .getRecords(options.type, `${options.field}:${query}` , 1, numberOfSuggestions)
      .pipe(
        map((results: Record) => {
          const names = [];
          if (!results) {
            return [];
          }
          results.hits.hits.map((hit: any) => {
            names.push({
              label: hit.metadata[options.field],
              value: this._apiService.getRefEndpoint(options.type, hit.metadata.pid)
              // add a group field to group the results
              // group: 'book'
            });
          });
          return names;
        })
      );
  }
}
