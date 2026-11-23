// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Location } from '@angular/common';
import { inject, Service } from '@angular/core';
import { ActivatedRoute, containsTree, Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { Observable, of, Subject } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { CONFIG } from '../../../core';
import { ActionStatus } from '../../../model/action-status.interface';
import { JsonObject, RecordData } from '../../../model/record.interface';
import { RecordType } from '../../model';
import { RecordService } from '../record/record.service';

@Service()
export class RecordUiService {
  protected translateService: TranslateService = inject(TranslateService);
  protected recordService: RecordService = inject(RecordService);
  protected router: Router = inject(Router);
  protected confirmationService: ConfirmationService = inject(ConfirmationService);
  protected messageService: MessageService = inject(MessageService);
  protected location: Location = inject(Location);

  /**
   * Delete a record by its PID.
   * @param type Type of resource
   * @param pid - string, PID to delete
   * @returns Observable resolving as a boolean
   */
  deleteRecord(type: string, pid: string, deleteMessage: string[] = this.defaultDeleteMessage()): Observable<boolean> {
    const delete$ = new Subject<boolean>();
    this.confirmationService.confirm({
      acceptLabel: this.translateService.instant('Delete'),
      rejectLabel: this.translateService.instant('Cancel'),
      message: deleteMessage.join('<br>'),
      header: this.translateService.instant('Confirmation'),
      icon: 'fa-solid fa-triangle-exclamation fa-2x core:text-red-500',
      acceptButtonStyleClass: 'core:bg-red-500 core:border-red-500',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.recordService.delete(type, pid).subscribe({
          next: () => {
            delete$.next(true);
            this.messageService.add({
              severity: 'info',
              summary: this.translateService.instant('Confirmed'),
              detail: this.translateService.instant('Record deleted.'),
              life: CONFIG.MESSAGE_LIFE,
            });
          },
          error: (error) => {
            delete$.next(false);
            this.messageService.add({
              severity: 'error',
              summary: this.translateService.instant('Error'),
              detail: this.translateService.instant(error.title),
              sticky: true,
              closable: true,
            });
          },
        });
      },
    });

    return delete$.asObservable();
  }

  /**
   * Show dialog with the reason why record cannot be deleted.
   * @param message Message to display
   */
  showDeleteMessage(message: string): void {
    this.confirmationService.confirm({
      acceptLabel: this.translateService.instant('OK'),
      rejectVisible: false,
      header: this.translateService.instant('Information'),
      message: message,
      acceptIcon: 'none',
    });
  }

  /**
   * Get resource configuration for given type.
   *
   * @param type Current type to find
   * @returns Object configuration for the current type
   */
  getResourceConfig<T = JsonObject>(types: Partial<RecordType>[], type: string): RecordType<T> {
    if (types == null) {
      throw new Error(`Configuration not found for type "${type}"`);
    }
    const index = types.findIndex((item) => item.key === type);
    if (index === -1) {
      throw new Error(`Configuration not found for type "${type}"`);
    }
    return types[index] as unknown as RecordType<T>;
  }

  /**
   * Redirects after saving a resource, without keeping the editor in the history.
   * @param pid - string, pid of the record
   * @param record - object, record to save
   * @param recordType - string, Type of resource
   * @param action - string, http action: create or update
   * @param route - ActivatedRoute: the current route used
   */
  redirectAfterSave<T = JsonObject>(
    pid: string,
    record: RecordData<T>,
    config: Partial<RecordType<T>> | null,
    action: string,
    route: ActivatedRoute,
  ): void {
    if (!config?.redirectUrl) {
      const detail = action === 'update' ? ['../../detail', pid] : ['../detail', pid];
      this.leavePage(this.router.createUrlTree(detail, { relativeTo: route }));
      return;
    }

    config.redirectUrl(record, action).subscribe((result: string) => {
      if (result !== null) {
        this.leavePage(this.router.parseUrl(result));
      }
    });
  }

  /**
   * Leave the current page (an editor, a deleted record) for the target page,
   * without keeping the current page in the browser history: go back if the
   * target is the previous page, replace the current page by the target
   * otherwise.
   * @param target - the page to display
   */
  leavePage(target: UrlTree): void {
    if (this.isPreviousPage(target)) {
      this.location.back();
      return;
    }
    this.router.navigateByUrl(target, { replaceUrl: true });
  }

  /**
   * Whether the target is the previous page in the browser history: same path,
   * with the target's query parameters (the previous page can have more, e.g.
   * a tab or a search).
   * @param target - the page to display
   */
  private isPreviousPage(target: UrlTree): boolean {
    const history = window.navigation;
    const previousUrl = history?.currentEntry && history.entries()[history.currentEntry.index - 1]?.url;
    if (!previousUrl) {
      return false;
    }
    // Both URLs as in the browser, with the base href.
    const { pathname, search } = new URL(previousUrl);
    const previous = this.router.parseUrl(pathname + search);
    const targetInBrowser = this.router.parseUrl(this.location.prepareExternalUrl(this.router.serializeUrl(target)));
    return containsTree(previous, targetInBrowser, { paths: 'exact', queryParams: 'subset' });
  }

  /**
   * Personalized message for delete a record
   * @param pid - record pid string
   * @param type - Type of resource
   * @returns  Observable array of string
   */
  deleteMessage<T = JsonObject>(pid: string, config?: Partial<RecordType<T>> | null): string[] {
    return config?.deleteMessage ? config.deleteMessage(pid) : this.defaultDeleteMessage();
  }

  // ================================================================
  //    Permissions
  // ================================================================

  /**
   * Check if a record can be added
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canAddRecord$(config: Partial<RecordType> | null): Observable<ActionStatus> {
    if (!config) {
      return of({ can: true, message: '' });
    }
    return config.canAdd ? config.canAdd().pipe(first()) : of({ can: true, message: '' });
  }

  /**
   * Check if a record can be updated
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canUpdateRecord$<T = JsonObject>(
    record: RecordData<T>,
    config: Partial<RecordType<T>> | null,
  ): Observable<ActionStatus> {
    if (!config) {
      return of({ can: true, message: '' });
    }
    // The canUpdate function takes precedence over permissions
    if (config.canUpdate) {
      return config.canUpdate(record).pipe(first());
    }
    if (config.permissions) {
      const permissions = config.permissions(record);
      return permissions.pipe(
        switchMap((perms) => {
          if ('canUpdate' in perms) {
            return of(perms.canUpdate);
          } else {
            return of({ can: true, message: '' });
          }
        }),
      );
    }
    return of({ can: true, message: '' });
  }

  /**
   * Check if a record can be deleted
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canDeleteRecord$<T = JsonObject>(
    record: RecordData<T>,
    config: Partial<RecordType<T>> | null,
  ): Observable<ActionStatus> {
    if (!config) {
      return of({ can: true, message: '' });
    }
    // The canDelete function takes precedence over permissions
    if (config.canDelete) {
      return config.canDelete(record).pipe(first());
    }
    if (config.permissions) {
      const permissions = config.permissions(record);
      return permissions.pipe(
        switchMap((perms) => {
          if ('canDelete' in perms) {
            return of(perms.canDelete);
          } else {
            return of({ can: true, message: '' });
          }
        }),
      );
    }
    return of({ can: true, message: '' });
  }

  /**
   * Check if a record can be read
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canReadRecord$<T = JsonObject>(
    record: RecordData<T>,
    config: Partial<RecordType<T>> | null,
  ): Observable<ActionStatus> {
    if (!config) {
      return of({ can: true, message: '' });
    }
    // The canRead function takes precedence over permissions
    if (config.canRead) {
      return config.canRead(record).pipe(first());
    }
    if (config.permissions) {
      const permissions = config.permissions(record);
      return permissions.pipe(
        switchMap((perms) => {
          if ('canRead' in perms) {
            return of(perms.canRead);
          } else {
            return of({ can: true, message: '' });
          }
        }),
      );
    }
    return of({ can: true, message: '' });
  }

  /**
   * Check if a record can be used (mainly used for templates)
   * @param record - object, record to check
   * @param type Type of resource
   * @returns Observable resolving an object containing the result of a permission check.
   */
  canUseRecord$<T = JsonObject>(
    record: RecordData<T>,
    config: Partial<RecordType<T>> | null,
  ): Observable<ActionStatus> {
    if (!config) {
      return of({ can: false, message: '' });
    }
    // The canUse function takes precedence over permissions
    if (config.canUse) {
      return config.canUse(record).pipe(first());
    }
    if (config.permissions) {
      const permissions = config.permissions(record);
      return permissions.pipe(
        switchMap((perms) => {
          if ('canUse' in perms) {
            return of(perms.canUse);
          } else {
            return of({ can: false, message: '' });
          }
        }),
      );
    }
    return of({ can: false, message: '' });
  }

  private defaultDeleteMessage(): string[] {
    return [this.translateService.instant('Do you really want to delete this record?')];
  }
}
