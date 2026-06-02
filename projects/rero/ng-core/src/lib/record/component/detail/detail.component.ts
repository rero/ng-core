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
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { ActionStatus } from '../../../model/action-status.interface';
import { RecordData } from '../../../model/record.interface';
import { RecordUiService } from '../../service/record-ui/record-ui.service';
import { RecordService } from '../../service/record/record.service';
import { RecordType } from '../../model';
import { DetailButtonComponent } from './detail-button/detail-button.component';
import { RecordActionEvent } from './detail-button/record-action-event.interface';
import { DefaultDetailComponent } from './default-detail/default-detail.component';
import { ErrorComponent } from '../../../core/component/error/error.component';
import { Error as RecordError } from '../../../core';
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

  private readonly recordRequest = computed(() => {
    const config = this.config();
    const pid = this.pid();
    const type = this.type();
    if (!config || !pid || !type) {
      return null;
    }
    return { config, pid };
  });
  private readonly recordContext = computed(() => ({
    record: this.record(),
    config: this.config(),
    type: this.type(),
  }));

  private readonly config = computed<RecordType | null>(() => {
    const types = this.getTypes();
    const type = this.type();
    if (!types.length || !type) return null;
    return types.find((t) => t.key === type) ?? null;
  });

  readonly record = toSignal(
    toObservable(this.recordRequest).pipe(
      switchMap((request) => {
        if (!request) {
          this.spinner.hide();
          return of(undefined);
        }

        this.error.set(undefined);
        this.spinner.show();

        const { config, pid } = request;
        const resourceType = config.index || config.key;
        return this.recordService
          .getRecord<RecordData>(resourceType, pid, {
            resolve: 1,
            headers: config.itemHeaders || new HttpHeaders({ 'Content-Type': 'application/json' }),
          })
          .pipe(
            map((record) => record ?? undefined),
            catchError((err) => {
              this.error.set(err);
              return of(undefined);
            }),
            finalize(() => this.spinner.hide()),
          );
      }),
    ),
    { initialValue: undefined },
  );
  readonly error = signal<RecordError | undefined>(undefined);
  readonly useStatus = toSignal(
    toObservable(this.recordContext).pipe(
      switchMap(({ record, config }) =>
        record && config
          ? this.recordUiService.canUseRecord$(record, config)
          : of({ can: false, message: '', url: '' }),
      ),
    ),
    { initialValue: { can: false, message: '', url: '' } },
  );
  readonly updateStatus = toSignal(
    toObservable(this.recordContext).pipe(
      switchMap(({ record, config }) =>
        record && config ? this.recordUiService.canUpdateRecord$(record, config) : of({ can: false, message: '' }),
      ),
    ),
    { initialValue: { can: false, message: '' } },
  );
  readonly deleteStatus = toSignal(
    toObservable(this.recordContext).pipe(
      switchMap(({ record, config }) =>
        record && config ? this.recordUiService.canDeleteRecord$(record, config) : of({ can: false, message: '' }),
      ),
    ),
    { initialValue: { can: false, message: '' } },
  );
  readonly adminMode = computed(() => this.routeData()?.adminMode ?? true);
  readonly canReadStatus = toSignal<ActionStatus | null>(
    toObservable(this.recordContext).pipe(
      switchMap(({ record, config }) => (record && config ? this.recordUiService.canReadRecord$(record, config) : of(null))),
    ),
    { initialValue: null },
  );

  constructor() {
    // Reactively render the detail component when config or record changes
    effect(() => {
      const config = this.config();
      const vcr = this.dynamicHost();
      vcr.clear();
      vcr.createComponent(config?.detailComponent || DefaultDetailComponent, {
        bindings: [
          inputBinding('record', () => this.record()),
          inputBinding('type', () => this.type()),
        ],
      });
    });

    effect(() => {
      const record = this.record();
      const type = this.type();
      if (!record || !type) {
        return;
      }

      const canReadStatus = this.canReadStatus();
      if (canReadStatus && !canReadStatus.can) {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant(type),
          detail: this.translate.instant('You cannot read this record'),
          sticky: true,
          closable: true,
        });
        this.location.back();
      }
    });
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
    const deleteMessage = this.recordUiService.deleteMessage(pid, this.config());
    this.recordUiService
      .deleteRecord(this.type(), pid, deleteMessage)
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
          } else {
            this.router.navigate([redirectUrl], navigateOptions);
          }
        }
      });
  }

  showDeleteMessage(message: string): void {
    this.recordUiService.showDeleteMessage(message);
  }

  private getTypes(): RecordType[] {
    const directTypes = (this.routeData()?.types ?? []) as RecordType[];
    if (directTypes.length > 0) {
      return directTypes;
    }

    let current = this.route.parent;
    while (current) {
      const inheritedTypes = (current.snapshot.data?.['types'] ?? []) as RecordType[];
      if (inheritedTypes.length > 0) {
        return inheritedTypes;
      }
      current = current.parent;
    }

    return [];
  }
}
