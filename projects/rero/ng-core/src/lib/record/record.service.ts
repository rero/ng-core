/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, debounceTime } from 'rxjs/operators';

import { Record } from './record';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  public static readonly DEFAULT_REST_RESULTS_SIZE = 10;
  public static readonly MAX_REST_RESULTS_SIZE = 9999;
  /**
   * Constructor
   * @param http - HttpClient
   * @param apiService - ApiService
   */
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  /**
   * Get records filtered by given parameters.
   * @param type - string, type of resource
   * @param query - string, keyword to search for
   * @param page - number, return records corresponding to this page
   * @param itemsPerPage - number, number of records to return
   * @param aggFilters - number, option list of filters
   * @param sort - parameter for sorting records (eg. 'mostrecent' or '-mostrecent')
   */
  public getRecords(
    type: string,
    query: string = '',
    page = 1,
    itemsPerPage = RecordService.DEFAULT_REST_RESULTS_SIZE,
    aggFilters: any[] = [],
    preFilters: object = {},
    headers: any = null,
    sort: string = null
  ): Observable<Record> {
    // Build query string
    let httpParams = new HttpParams().set('q', query);
    httpParams = httpParams.append('page', '' + page);
    httpParams = httpParams.append('size', '' + itemsPerPage);

    if (sort) {
      httpParams = httpParams.append('sort', sort);
    }

    aggFilters.forEach((filter) => {
      filter.values.forEach((value: string) => {
        httpParams = httpParams.append(filter.key, value);
      });
    });

    for (const key of Object.keys(preFilters)) {
      httpParams = httpParams.append(key, preFilters[key]);
    }

    return this.http.get<Record>(this.apiService.getEndpointByType(type, true) + '/', {
      params: httpParams,
      headers: this.createRequestHeaders(headers)
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete a record.
   * @param type - string, type of record
   * @param pid - string, PID to remove
   */
  public delete(type: string, pid: string): Observable<void> {
    return this.http.delete<void>(this.apiService.getEndpointByType(type, true) + '/' + pid)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get record data
   * @param type - string, type of resource
   * @param pid - string, record PID
   */
  public getRecord(type: string, pid: string, resolve = 0, headers: any = {}): Observable<any> {
    return this.http.get<Record>(`${this.apiService.getEndpointByType(type, true)}/${pid}?resolve=${resolve}`, {
      headers: this.createRequestHeaders(headers)
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Return the schema form to generate the form based on the resource given.
   * @param recordType - string, type of the resource
   */
  public getSchemaForm(recordType: string) {
    let recType = recordType.replace(/ies$/, 'y');
    recType = recType.replace(/s$/, '');
    const url = this.apiService.getSchemaFormEndpoint(recordType);
    return this.http.get<any>(url).pipe(
      catchError(e => {
        if (e.status === 404) {
          return of(null);
        }
      }),
      map(data => {
        return data;
      })
    );
  }

  /**
   * Create a new record
   * @param recordType - string, type of resource
   * @param record - object, record to create
   */
  public create(recordType: string, record: object): Observable<any> {
    return this.http.post(this.apiService.getEndpointByType(recordType, true) + '/', record);
  }

  /**
   * Create a new record
   * @param recordType - string, type of resource
   * @param record - object, record to create
   * @param pid - string, record PID
   */
  public update(recordType: string, record: { pid: string }) {
    const url = `${this.apiService.getEndpointByType(recordType, true)}/${record.pid}`;
    return this.http.put(url, record);
  }

  /**
   * Check if a record is already registered with the same value
   * @param recordType - string, type of record
   * @param field - string, field to check
   * @param value - string, value to check
   * @param excludePid - string, PID to ignore (normally the current record we are checking)
   */
  public valueAlreadyExists(recordType: string, field: string, value: string, excludePid: string) {
    let query = `${field}:"${value}"`;
    if (excludePid) {
      query += ` NOT pid:${excludePid}`;
    }
    return this.getRecords(recordType, query, 1, 0).pipe(
      map(res => res.hits.total),
      map(total => total ? { alreadyTakenMessage: value } : null),
      debounceTime(1000)
    );
  }

  /**
   * Error handling during api call process.
   * @param error - HttpErrorResponse
   */
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

  /**
   * Creates and returns a HttpHeader object to send to request.
   * @param headers Object containing http headers to send to request.
   */
  private createRequestHeaders(headers: any = {}) {
    return headers ? new HttpHeaders(headers) : new HttpHeaders({ 'Content-Type': 'application/json' });
  }
}
