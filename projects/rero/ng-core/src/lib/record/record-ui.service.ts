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
import { map, mergeMap, delay, first } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import { DialogService } from '../dialog/dialog.service';
import { RecordService } from './record.service';
import { ActionStatus } from './action-status';

@Injectable({
  providedIn: 'root'
})
export class RecordUiService {
  /** Configuration for all resources. */
  types = [];

  constructor(
    private dialogService: DialogService,
    private toastService: ToastrService,
    private translate: TranslateService,
    private recordService: RecordService
  ) { }

  /**
   * Delete a record by its PID.
   * @param pid - string, PID to delete
   * @param type Type of resource
   * @returns Observable resolving as a boolean
   */
  deleteRecord(pid: string, type: string): Observable<boolean> {
    const observable = this.dialogService.show({
      ignoreBackdropClick: true,
      initialState: {
        title: this.translate.instant('Confirmation'),
        body: this.translate.instant('Do you really want to delete this record?'),
        confirmButton: true,
        confirmTitleButton: this.translate.instant('Delete'),
        cancelTitleButton: this.translate.instant('Cancel')
      }
    }).pipe(
      // return a new observable depending on confirm dialog result.
      mergeMap((confirm: boolean) => {
        if (confirm === false) {
          return of(false);
        }

        return this.recordService.delete(type, pid).pipe(
          map(() => {
            this.toastService.success(this.translate.instant('Record deleted.'));
            return true;
          }),
          // delay before doing anything else, otherwise records may be not refreshed.
          delay(1000)
        );
      })
    );

    return observable;
  }

  /**
   * Show dialog with the reason why record cannot be deleted.
   * @param message Message to display
   */
  showDeleteMessage(message: string) {
    this.dialogService.show({
      initialState: {
        title: this.translate.instant('Information'),
        body: message,
        confirmButton: false,
        cancelTitleButton: this.translate.instant('OK')
      }
    }).subscribe();
  }

  /**
   * Get resource configuration for given type.
   *
   * @param types Types in configuration
   * @param type Current type to find
   * @returns Object configuration for the current type
   */
  getResourceConfig(type: string): any {
    const index = this.types.findIndex(item => item.key === type);

    if (index === -1) {
      throw new Error(`Configuration not found for type "${type}"`);
    }

    return this.types[index];
  }

  /**
   * Check if a record can be added
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canAddRecord$(type: string): Observable<ActionStatus> {
    const config = this.getResourceConfig(type);

    if (config.canAdd) {
      return config.canAdd().pipe(first());
    }

    return of({ can: true, message: '' });
  }

  /**
   * Check if a record can be updated
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canUpdateRecord$(record: object, type: string): Observable<ActionStatus> {
    const config = this.getResourceConfig(type);

    if (config.canUpdate) {
      return config.canUpdate(record).pipe(first());
    }

    return of({ can: true, message: '' });
  }

  /**
   * Check if a record can be deleted
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canDeleteRecord$(record: object, type: string): Observable<ActionStatus> {
    const config = this.getResourceConfig(type);

    if (config.canDelete) {
      return config.canDelete(record).pipe(first());
    }

    return of({ can: true, message: '' });
  }

  /**
   * Check if a record can be read
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canReadRecord$(record: object, type: string): Observable<ActionStatus> {
    const config = this.getResourceConfig(type);

    if (config.canRead) {
      return config.canRead(record).pipe(first());
    }

    return of({ can: true, message: '' });
  }
}
