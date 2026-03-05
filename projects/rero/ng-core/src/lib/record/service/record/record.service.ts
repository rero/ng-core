/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';
import { Error } from '../../../core/component/error/error.interface';
import { EsResult, JsonObject, JsonValue, RecordData } from '../../../model';
import { resolveRefs } from '../../editor/utils/utils';
import { ApiService } from '../api/api.service';
import { RecordHandleErrorService } from '../record-handle-error/record-handle-error.service';

/** Record Event Interface */
export interface RecordEvent {
  resource: string;
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class RecordService {

  protected http: HttpClient = inject(HttpClient);
  protected apiService: ApiService = inject(ApiService);
  protected translateService: TranslateService = inject(TranslateService);
  protected recordHandleErrorService: RecordHandleErrorService = inject(RecordHandleErrorService);

  static readonly DEFAULT_REST_RESULTS_SIZE = 10;
  static readonly MAX_REST_RESULTS_SIZE = 9999;

  /**
   * Get records filtered by given parameters.
   *
   * @param type - string, type of resource
   * @param query - string, keyword to search for
   * @param page - number, return records corresponding to this page
   * @param itemsPerPage - number, number of records to return
   * @param aggregationsFilters - list, option list of filters; usually used by
   *                              the aggregation filters.
   * @param preFilters - object, option list of additional filters.  The value can
   *                     a string or a list of string to filter with multiple values.
   * @param headers - HttpHeaders optional http header for the backend call.
   * @param sort - parameter for sorting records (eg. 'mostrecent' or '-mostrecent')
   * @param facets - list of strings, define which aggregations/facets should be included into the response.
   */
  getRecords<T = EsResult>(
    type: string,
    {
    query = '',
    page = 1,
    itemsPerPage = RecordService.DEFAULT_REST_RESULTS_SIZE,
    aggregationsFilters = [],
    preFilters = {},
    sort = '',
    facets = [],
    headers = new HttpHeaders({ 'Content-Type': 'application/json' })
  }: {
    query?: string;
    page?: number;
    itemsPerPage?: number;
    aggregationsFilters?: Record<string, any>[];
    preFilters?: Record<string, string | string[]>;
    sort?: string;
    facets?: string[];
    headers?: HttpHeaders | Record<string, string | string[]>;
  } = {}
): Observable<T> {
    // Build query string
    let httpParams = new HttpParams().set('q', query);
    httpParams = httpParams.append('page', '' + page);
    httpParams = httpParams.append('size', '' + itemsPerPage);

    if (sort) {
      httpParams = httpParams.append('sort', sort);
    }

    // aggregationsFilters
    aggregationsFilters.map((filter) => {
      filter.values.map((value: string) => {
        httpParams = httpParams.append(filter.key, value);
      });
    });

    // preFilters
    for (const key of Object.keys(preFilters)) {
      const value = preFilters[key];
      if (Array.isArray(value)) {
        value.map((val) => {
          httpParams = httpParams.append(key, val);
        });
      } else {
        httpParams = httpParams.append(key, value);
      }
    }

    // facets management
    //   if array `facets` is an empty array, no aggregations data will be included into response.s
    httpParams = httpParams.append('facets', facets.join(','));

    // http request with headers
    return this.http
      .get<T>(this.apiService.getEndpointByType(type, true) + '/', {
        params: httpParams,
        headers: headers
      })
      .pipe(catchError((error) => this._handleError(error)));
  }

  /**
   * Delete a record.
   * @param type - string, type of record
   * @param pid - string, PID to remove
   */
  delete(type: string, pid: string): Observable<void | Error> {
    return this.http
      .delete<void>(this.apiService.getEndpointByType(type, true) + '/' + pid)
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  /**
   * Get record data
   * @param type - string, type of resource
   * @param pid - string, record PID
   */
  getRecord<T = RecordData>(
    type: string,
    pid: string,
    {
      resolve = 0,
      headers = new HttpHeaders({ 'Content-Type': 'application/json' })
    } : {
      resolve?: number;
      headers?: HttpHeaders | Record<string, string | string[]>;
    } = {}
  ): Observable<T> {
    return this.http
      .get<T>(
        `${this.apiService.getEndpointByType(
          type,
          true
        )}/${pid}?resolve=${resolve}`,
        {
          headers: headers,
        }
      )
      .pipe(catchError((error) => this._handleError(error)));
  }

  /**
   * Return the schema form to generate the form based on the resource given.
   * @param recordType - string, type of the resource
   */
  getSchemaForm(recordType: string): Observable<JsonValue | null> {
    const url = this.apiService.getSchemaFormEndpoint(recordType, true);
    return this.http.get<JsonValue>(url).pipe(
      catchError(e => {
        if (e.status === 404) {
          return of(null);
        }
        return throwError(() => e);
      }),
      map((data) => {
        return data;
      })
    );
  }

  /**
   * Create a new record
   * @param recordType - string, type of resource
   * @param record - object, record to create
   */
  create<TMetadata = JsonObject>(recordType: string, record: TMetadata): Observable<RecordData<TMetadata>> {
    return this.http
      .post<RecordData<TMetadata>>(this.apiService.getEndpointByType(recordType, true) + '/', record)
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  /**
   * Update a record
   * @param recordType - string, type of resource
   * @param pid - string, record PID
   * @param record - object, record to update
   */
  update<TMetadata = JsonObject>(recordType: string, pid: string, record: TMetadata): Observable<RecordData<TMetadata>> {
    const url = `${this.apiService.getEndpointByType(recordType, true)}/${pid}`;
    return this.http
      .put<RecordData<TMetadata>>(url, record)
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  /**
   * Check if a record is already registered with the same value
   * @param recordType - string, type of record
   * @param field - string, field to check
   * @param value - string, value to check
   * @param excludePid - string, PID to ignore (normally the current record we are checking)
   */
  valueAlreadyExists(
    recordType: string,
    field: string,
    value: string,
    excludePid?: string
  ): Observable<(ValidationErrors |null)> {
    const escapedValue = value.replace(/"/g, '\\"');
    let query = `${field}:"${escapedValue}"`;

    if (excludePid != null) {
      query += ` NOT pid:${excludePid}`;
    }

    return this.getRecords(recordType, {query, itemsPerPage: 1}).pipe(
      map((res): number | string => {
        if (!res.hits) {
          return 0;
        }
        return res?.hits?.total
          ? this.totalHits(res.hits.total)
          : 0;
      }),
      map(total => Number(total)),
      map(total => (total > 0 ? { alreadyTaken: value } : null)),
      debounceTime(1000)
    );
  }

  /**
   * Check if a record is already registered with the same value
   * @param field - FormlyFieldConfig, field to check
   * @param recordType - string, type of record
   * @param excludePid - string, PID to ignore (normally the current record we are checking)
   * @param term - string, the elasticsearch term to check the uniqueness, use field.key if not given
   * @param limitToValues - string[], limit the test to a given list of values
   * @param filter - string, additional es query filters
   */
  uniqueValue(
    field: FormlyFieldConfig,
    recordType: string,
    excludePid?: string,
    term?: string,
    limitToValues?: string[],
    filter?: string
  ) {
    let key = field.key;
    if (term != null) {
      key = term;
    }
    let value = field?.formControl?.value;
    const model = resolveRefs(field.model);
    if (value == null) {
      return of(true);
    }
    if (typeof (value) === 'string') {
      value = value.replace(/"/g, '\\"');
    }
    if (limitToValues && limitToValues?.length > 0 && !limitToValues.some((v) => v === value)) {
      return of(true);
    }
    let query = `${key}:${value}`;
    if (typeof value === 'string') {
      query = `${key}:"${value}"`;
    }
    if (filter != null) {
      const filterFn = Function('model', `return ${filter};`);
      query = `${query} AND ` + filterFn(model);
    }
    if (excludePid != null) {
      query += ` NOT pid:${excludePid}`;
    }
    return this.getRecords(recordType, {query, itemsPerPage: 1}).pipe(
      map((res): number | string | null => {
        if (!res?.hits) {
          return null;
        }
        return res.hits?.total
          ? this.totalHits(res.hits.total)
          : 0;
      }),
      map((total) => (total ? { alreadyTaken: value } : null)),
      debounceTime(500)
    );
  }

  /**
   * Transform a total value string or object representation
   * (ES compatibility v6 and v7)
   * @param total - string or object
   * @param relation - boolean
   * @return integer, text or null
   */
  totalHits(
    total: number | string | { relation: string; value: number },
    relation = false
  ): number | string {
    switch (typeof total) {
      case 'object': {
        if (!('value' in total)) {
          throw new Error('Invalid total object: missing value property');
        }

        if (relation) {
          return `${this.translateService.instant(total.relation)} ${total.value}`;
        }

        return Number(total.value);
      }

      case 'number':
        return total;

      case 'string': {
        const parsed = Number(total);
        if (Number.isNaN(parsed)) {
          throw new Error(`Invalid total string value: "${total}"`);
        }
        return parsed;
      }

      default:
        throw new Error(`Unsupported total type: ${typeof total}`);
    }
  }

  /**
   * Return the suggestions for query and field.
   *
   * @param resource Resource type.
   * @param url URL of suggestions endpoint.
   * @param field Field to search for suggestions.
   * @param q Query.
   * @returns Observable containing the list of suggestions.
   */
  suggestions(
    resource: string,
    url: string,
    field: string,
    q: string
  ): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiService.baseUrl}${url}`, {
      params: { resource, field, q },
    });
  }

  /**
   * Error handling during api call process.
   * @param error - HttpErrorResponse
   * @return throwError
   */
  private _handleError(error: HttpErrorResponse): Observable<never> {
    return this.recordHandleErrorService.handleError(error);
  }

}
