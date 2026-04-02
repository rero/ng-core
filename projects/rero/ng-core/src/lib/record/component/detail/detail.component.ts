/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  inputBinding,
  signal,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { catchError, combineLatest, filter, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { ActionStatus } from '../../../model/action-status.interface';
import { RecordData } from '../../../model/record.interface';
import { RecordUiService } from '../../service/record-ui/record-ui.service';
import { RecordService } from '../../service/record/record.service';
import { RecordType } from '../../model';
import { DetailButtonComponent } from './detail-button/detail-button.component';
import { RecordActionEvent } from './detail-button/record-action-event.interface';
import { DefaultDetailComponent } from './default-detail/default-detail.component';
import { ErrorComponent } from '../../../core/component/error/error.component';
import { Error } from '../../../core';
import { HttpHeaders } from '@angular/common/http';

@Component({
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailButtonComponent, ErrorComponent],
})
export class DetailComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly location = inject(Location);
  protected readonly recordService = inject(RecordService);
  protected readonly recordUiService = inject(RecordUiService);
  protected readonly translate = inject(TranslateService);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly dynamicHost = viewChild.required('dynamicHost', { read: ViewContainerRef });

  private readonly paramMap = toSignal(this.route.paramMap, { requireSync: true });
  private readonly routeData = toSignal(this.route.data, { requireSync: true });

  readonly type = computed(() => this.paramMap().get('type') ?? '');
  readonly pid = computed(() => this.paramMap().get('pid') ?? '');

  private readonly params = computed(() => ({ type: this.type(), pid: this.pid() }));

  private readonly config = computed<RecordType | null>(() => {
    const types: RecordType[] = this.routeData()?.types ?? [];
    const type = this.type();
    if (!types.length || !type) return null;
    return types.find((t) => t.key === type) ?? null;
  });

  readonly useStatus = signal<ActionStatus>({ can: false, message: '', url: '' });
  readonly updateStatus = signal<ActionStatus>({ can: false, message: '' });
  readonly deleteStatus = signal<ActionStatus>({ can: false, message: '' });
  readonly record = signal<RecordData | undefined>(undefined);
  readonly error = signal<Error | undefined>(undefined);
  readonly adminMode = signal<ActionStatus>({ can: true, message: '' });

  constructor() {
    // Keep recordUiService.types in sync with route data
    effect(() => {
      const types = this.routeData()?.types;
      if (types?.length) {
        this.recordUiService.types = types;
      }
    });

    // Reactively render the detail component when config or record changes
    effect(() => {
      const vcr = this.dynamicHost();
      vcr.clear();
      vcr.createComponent(this.config()?.component || DefaultDetailComponent, {
        bindings: [
          inputBinding('record', () => this.record()),
          inputBinding('type', () => this.type()),
        ],
      });
    });

    toObservable(this.params).pipe(
      filter(({ type, pid }) => !!type && !!pid),
      tap(() => this.spinner.show()),
      switchMap(({ type, pid }) => {
        const config = this.config();
        if (!config) {
          this.spinner.hide();
          return of(void 0);
        }

        const resourceType = config.index || config.key;
        const record$ = this.recordService
          .getRecord<RecordData>(resourceType, pid, {
            headers: config.itemHeaders || new HttpHeaders({ 'Content-Type': 'application/json' }),
          })
          .pipe(
            catchError((err) => {
              this.error.set(err);
              return of(null);
            }),
          );

        return record$.pipe(
          switchMap((record) => {
            this.record.set(record ?? undefined);
            if (!record) {
              return of(void 0);
            }

            const adminMode$: Observable<ActionStatus> = this.route.snapshot.data.adminMode
              ? this.route.snapshot.data.adminMode()
              : of(this.adminMode());

            return combineLatest([
              this.recordUiService.canReadRecord$(record, type),
              this.recordUiService.canDeleteRecord$(record, type),
              this.recordUiService.canUpdateRecord$(record, type),
              this.recordUiService.canUseRecord$(record, type),
              adminMode$,
            ]).pipe(
              tap(([canRead, canDelete, canUpdate, canUse, adminMode]) => {
                if (!canRead.can) {
                  this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant(type),
                    detail: this.translate.instant('You cannot read this record'),
                    sticky: true,
                    closable: true,
                  });
                  this.location.back();
                }
                this.deleteStatus.set(canDelete);
                this.updateStatus.set(canUpdate);
                this.useStatus.set(canUse);
                this.adminMode.set(adminMode);
              }),
              map(() => void 0),
            );
          }),
          finalize(() => this.spinner.hide()),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  recordEvent(event: RecordActionEvent): void {
    switch (event.action) {
      case 'use':
        if (event.url) {
          this.router.navigateByUrl(event.url);
        }
        break;
      case 'update':
        this.router.navigate(['../../edit', event.record.id], { relativeTo: this.route, replaceUrl: true });
        break;
      case 'delete':
        this.deleteRecord(event.record);
        break;
      default:
        throw new Error('Missing record event action.');
    }
  }

  deleteRecord(element: RecordData | string): void {
    const pid = typeof element === 'object' ? element.id : element;
    this.recordUiService
      .deleteRecord(this.type(), pid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: boolean) => {
        if (result === true) {
          let redirectUrl = '../..';
          const navigateOptions = { relativeTo: this.route };
          if (typeof element === 'object' && this.config()?.redirectUrl) {
            this.config()!
              .redirectUrl!(element, 'delete')
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe((redirect: string) => {
                if (redirect !== null) {
                  redirectUrl = redirect;
                }
                this.router.navigate([redirectUrl], navigateOptions);
              });
          }
          this.router.navigate([redirectUrl], navigateOptions);
        }
      });
  }

  showDeleteMessage(message: string): void {
    this.recordUiService.showDeleteMessage(message);
  }

}
