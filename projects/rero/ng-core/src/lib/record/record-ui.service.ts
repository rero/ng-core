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
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DialogService } from '../dialog/dialog.service';
import { ActionStatus } from './action-status';
import { RecordService } from './record.service';

@Injectable({
  providedIn: 'root'
})
export class RecordUiService {
  /** Configuration for all resources. */
  types = [];

  /**
   * Constructor.
   *
   * @param _dialogService Dialog service.
   * @param _toastService Toast service.
   * @param _translateService Translate service.
   * @param _recordService Record service.
   * @param _router Router.
   * @param _spinner Spinner service.
   */
  constructor(
    private _dialogService: DialogService,
    private _toastService: ToastrService,
    private _translateService: TranslateService,
    private _recordService: RecordService,
    private _router: Router,
    private _spinner: NgxSpinnerService
  ) { }

  /**
   * Delete a record by its PID.
   * @param type Type of resource
   * @param pid - string, PID to delete
   * @returns Observable resolving as a boolean
   */
  deleteRecord(type: string, pid: string): Observable<boolean> {
    const observable = this.deleteMessage$(pid, type).pipe(map((messages: string[]) => {
      const translateMessages = [];
      messages.forEach((message: string) => {
        translateMessages.push(message);
      });
      return translateMessages.join('\n');
    }), switchMap((message: string) => {
      return this._dialogService.show({
        ignoreBackdropClick: true,
        initialState: {
          title: this._translateService.instant('Confirmation'),
          body: message,
          confirmButton: true,
          confirmTitleButton: this._translateService.instant('Delete'),
          cancelTitleButton: this._translateService.instant('Cancel')
        }
      }).pipe(
        // return a new observable depending on confirm dialog result.
        mergeMap((confirm: boolean) => {
          if (confirm === false) {
            return of(false);
          }

          this._spinner.show();

          return this._recordService.delete(type, pid).pipe(
            map(() => {
              return true;
            }),
            tap(() => {
              this._spinner.hide();
              this._toastService.success(this._translateService.instant('Record deleted.'));
            })
          );
        })
      );
    }));

    return observable;
  }

  /**
   * Show dialog with the reason why record cannot be deleted.
   * @param message Message to display
   */
  showDeleteMessage(message: string) {
    this._dialogService.show({
      initialState: {
        title: this._translateService.instant('Information'),
        body: message,
        confirmButton: false,
        cancelTitleButton: this._translateService.instant('OK')
      }
    }).subscribe();
  }

  /**
   * Get resource configuration for given type.
   *
   * @param type Current type to find
   * @returns Object configuration for the current type
   */
  getResourceConfig(type: string): any {
    if (this.types == null) {
      throw new Error(`Configuration not found for type "${type}"`);
    }
    const index = this.types.findIndex(item => item.key === type);
    if (index === -1) {
      throw new Error(`Configuration not found for type "${type}"`);
    }
    return this.types[index];
  }

  /**
   * Redirects after saving a resource
   * @param pid - string, pid of the record
   * @param record - object, record to save
   * @param recordType - string, Type of resource
   * @param action - string, http action: create or update
   * @param route - ActivatedRoute: the current route used
   */
  redirectAfterSave(pid: string, record: any, recordType: string, action: string, route: ActivatedRoute) {
    const config = this.getResourceConfig(recordType);
    if (config.redirectUrl) {
      config.redirectUrl(record, action).subscribe((result: string) => {
        if (result !== null) {
          this._router.navigate([result]);
          return;
        }
      });
    } else {
      // Default behaviour
      if (action === 'update') {
        this._router.navigate(['../../detail', pid], {relativeTo: route, replaceUrl: true});
        return;
      }
      this._router.navigate(['../detail', pid], {relativeTo: route, replaceUrl: true});
    }
  }

  /**
   * Personalized message for delete a record
   * @param pid - record pid string
   * @param type - Type of resource
   * @returns  Observable array of string
   */
    deleteMessage$(pid: string, type: string): Observable<string[]> {
      const defaultMessage = of([
        this._translateService.instant('Do you really want to delete this record?')
      ]);
      try {
        const config = this.getResourceConfig(type);
        return (config.deleteMessage)
          ? config.deleteMessage(pid)
          : defaultMessage;
      } catch {
        return defaultMessage;
      }
    }

  // ================================================================
  //    Permissions
  // ================================================================

  /**
   * Check if a record can be added
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canAddRecord$(type: string): Observable<ActionStatus> {
    const config = this.getResourceConfig(type);
    return (config.canAdd)
      ? config.canAdd().pipe(first())
      : of({ can: true, message: '' });
  }

  /**
   * Check if a record can be updated
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canUpdateRecord$(record: object, type: string): Observable<ActionStatus> {
    const config = this.getResourceConfig(type);
    if (config.permissions) {
      const permissions = config.permissions(record);
      return permissions.pipe(
        map((perms: any) => {
          if ('canUpdate' in perms) {
            return perms.canUpdate;
          } else {
            return of({ can: true, message: '' });
          }
        })
      );
    }
    return (config.canUpdate)
      ? config.canUpdate(record).pipe(first())
      : of({ can: true, message: '' });
  }

  /**
   * Check if a record can be deleted
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canDeleteRecord$(record: object, type: string): Observable<ActionStatus> {
    const config = this.getResourceConfig(type);
    if (config.permissions) {
      const permissions = config.permissions(record);
      return permissions.pipe(
        map((perms: any) => {
          if ('canDelete' in perms) {
            return perms.canDelete;
          } else {
            return of({ can: true, message: '' });
          }
        })
      );
    }
    return (config.canDelete)
      ? config.canDelete(record).pipe(first())
      : of({ can: true, message: '' });
  }

  /**
   * Check if a record can be read
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canReadRecord$(record: object, type: string): Observable<ActionStatus> {
    const config = this.getResourceConfig(type);
    if (config.permissions) {
      const permissions = config.permissions(record);
      return permissions.pipe(
        map((perms: any) => {
          if ('canRead' in perms) {
            return perms.canRead;
          } else {
            return of({ can: true, message: '' });
          }
        })
      );
    }
    return (config.canRead)
      ? config.canRead(record).pipe(first())
      : of({ can: true, message: '' });
  }

  /**
   * Check if a record can be used (mainly used for templates)
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
   canUseRecord$(record: object, type: string): Observable<ActionStatus> {
    const config = this.getResourceConfig(type);
    if (config.permissions) {
      const permissions = config.permissions(record);
      if ('canUse' in permissions) {
        return permissions.canUse;
      }
    }
    return (config.canUse)
        ? config.canUse(record).pipe(first())
        : of({ can: false, message: '' });
   }
}
