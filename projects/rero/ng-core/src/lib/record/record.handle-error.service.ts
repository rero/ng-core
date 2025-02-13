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
import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordHandleErrorService {

  protected translateService: TranslateService = inject(TranslateService);

  /**
   * handle http error
   * @param error - HttpErrorResponse
   * @returns Observable
   */
  handleError(error: HttpErrorResponse, resourceName?: string): Observable<never> {
    return this.standardHandleError(error);
  }

  /**
   * Standard handle error (base error)
   * @param error - HttpErrorResponse
   * @returns Observable
   */
  protected standardHandleError(error: HttpErrorResponse): Observable<never> {
    // handle Marshmallow errors
    //   Python marshmallow library can raise ValidationError. In this case, the message is simply 'Validation error'
    //   but list of errors are passed into the `errors` fields.
    if (error.error?.errors) {
      const message = typeof(error.error.errors) === 'object'
      ? error.error.errors.message
      : error.error.errors
          .map(err => this.translateService.instant(err.message))
          .join('; ');
      return throwError(() => ({ status: error.status, title: message}));
    }

    // check if we have possible custom error message to display
    if (error.status === 400 && error.error.hasOwnProperty('message')) {
      let { message } = error.error;
      message = message.replace(/^Validation error: /, '').trim();  // Remove Invenio `ValidationError` header
      return throwError(() => ({ status: error.status, title: this.translateService.instant(message) }));
    }

    // If not, then return default message
    switch (error.status) {
      case 400:
        return throwError(() => ({ status: error.status, title: this.translateService.instant('Bad request') }));
      case 401:
        return throwError(() => ({ status: error.status, title: this.translateService.instant('Unauthorized') }));
      case 403:
        return throwError(() => ({ status: error.status, title: this.translateService.instant('Forbidden') }));
      case 404:
        return throwError(() => ({ status: error.status, title: this.translateService.instant('Not found') }));
      default:
        return throwError(() => ({ status: 500, title: this.translateService.instant('An error occurred') }));
    }
  }
}
