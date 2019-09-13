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
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Record } from './record';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient, private apiService: ApiService) { }

  /**
   * Get records filtered by given parameters.
   * @param type - string, type of resource
   * @param query - string, keyword to search for
   * @param page - number, return records corresponding to this page
   * @param itemsPerPage - number, number of records to return
   * @param aggFilters - number, option list of filters
   */
  public getRecords(type: string, query: string = '', page = 1, itemsPerPage = 20, aggFilters: any[] = []): Observable<Record> {
    // Build query string
    let httpParams = new HttpParams().set('q', query);
    httpParams = httpParams.append('page', '' + page);
    httpParams = httpParams.append('size', '' + itemsPerPage);
    aggFilters.forEach((filter) => {
      filter.values.forEach((value) => {
        httpParams = httpParams.append(filter.key, value);
      });
    });

    return this.http.get<Record>(this.apiService.getEndpointByType(type, true) + '/', { params: httpParams })
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
  public getRecord(type: string, pid: string): Observable<any> {
    return this.http.get<Record>(this.apiService.getEndpointByType(type, true) + '/' + pid)
      .pipe(
        catchError(this.handleError)
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
}
