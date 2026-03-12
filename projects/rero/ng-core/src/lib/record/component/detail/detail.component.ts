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
  DestroyRef,
  inject,
  input,
  inputBinding,
  linkedSignal,
  OnInit,
  signal,
  viewChild,
  ViewContainerRef,
  Type,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { catchError, combineLatest, finalize, isObservable, map, Observable, of, switchMap, tap } from 'rxjs';
import { RecordData } from '../../../model/record.interface';
import { ActionStatus } from '../../../model/action-status.interface';
import { RecordUiService } from '../../service/record-ui/record-ui.service';
import { RecordService } from '../../service/record/record.service';
import { DetailButtonComponent } from './detail-button/detail-button.component';
import { RecordActionEvent } from './detail-button/record-action-event.interface';
import { RecordDetailDirective } from './detail.directive';
import { DefaultDetailComponent } from './default-detail/default-detail.component';
import { ErrorComponent } from '../../../core/component/error/error.component';
import { Error } from '../../../core';
import { HttpHeaders } from '@angular/common/http';

interface DetailViewConfig {
  key: string;
  detailComponent?: Type<unknown> | Observable<Type<unknown>>;
}

interface DetailResourceConfig {
  key: string;
  index?: string;
  itemHeaders?: HttpHeaders | Record<string, string | string[]>;
  redirectUrl?: (record: RecordData, action: string) => Observable<string>;
  files?: { enabled?: boolean };
}

@Component({
  selector: 'ng-core-record-detail',
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailButtonComponent, ErrorComponent, RecordDetailDirective],
})
export class DetailComponent implements OnInit {
  protected route: ActivatedRoute = inject(ActivatedRoute);
  protected router: Router = inject(Router);
  protected location: Location = inject(Location);
  protected recordService: RecordService = inject(RecordService);
  protected recordUiService: RecordUiService = inject(RecordUiService);
  protected translate: TranslateService = inject(TranslateService);
  protected spinner: NgxSpinnerService = inject(NgxSpinnerService);
  protected messageService: MessageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  protected viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  /** View component for displaying record */
  readonly viewComponent = input<Type<unknown> | null>(null);
  protected _viewComponent = linkedSignal<Type<unknown> | null>(() => this.viewComponent());

  /** Record can be used ? */
  readonly useStatus = signal<ActionStatus>({ can: false, message: '', url: '' });

  /** Record can be updated ? */
  readonly updateStatus = signal<ActionStatus>({ can: false, message: '' });

  /** Record can be deleted ? */
  readonly deleteStatus = signal<ActionStatus>({ can: false, message: '' });

  /** Observable resolving record data */
  record$: Observable<RecordData | null> = new Observable<RecordData>();

  /** Record data */
  readonly record = signal<RecordData | undefined>(undefined);

  /** Error message */
  readonly error = signal<Error | undefined>(undefined);

  /** Admin mode for CRUD operations */
  readonly adminMode = signal<ActionStatus>({ can: true, message: '' });

  /** Type of record */
  readonly type = signal('');

  /** Object type route config */
  private config: DetailResourceConfig | null = null;

  /** Directive for displaying record */
  readonly recordDetail = viewChild(RecordDetailDirective);

  /** On init hook */
  ngOnInit() {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.spinner.show();
          this.loadViewComponentRef();
        }),
        switchMap(() => {
          const pid = this.route.snapshot.paramMap.get('pid');
          this.type.set(this.route.snapshot.paramMap.get('type') ?? '');
          if (!pid || !this.type()) {
            return of(void 0);
          }

          this.recordUiService.types = this.route.snapshot.data.types;
          this.config = this.recordUiService.getResourceConfig(this.type());

          const type = this.config.index || this.config.key;
          this.record$ = this.recordService
            .getRecord(type, pid, {
              headers: this.config.itemHeaders || new HttpHeaders({ 'Content-Type': 'application/json' }),
            })
            .pipe(
              catchError((error) => {
                this.error.set(error);
                return of(null);
              }),
            );
          this.loadRecordView();

          return this.record$.pipe(
            switchMap((record) => {
              this.record.set(record ?? undefined);
              if (!record) {
                return of(void 0);
              }

              const adminMode$: Observable<ActionStatus> = this.route.snapshot.data.adminMode
                ? this.route.snapshot.data.adminMode()
                : of(this.adminMode());

              return combineLatest([
                this.recordUiService.canReadRecord$(record, this.type()),
                this.recordUiService.canDeleteRecord$(record, this.type()),
                this.recordUiService.canUpdateRecord$(record, this.type()),
                this.recordUiService.canUseRecord$(record, this.type()),
                adminMode$,
              ]).pipe(
                tap(([canRead, canDelete, canUpdate, canUse, adminMode]) => {
                  if (canRead.can === false) {
                    this.messageService.add({
                      severity: 'error',
                      summary: this.translate.instant(this.type()),
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
      )
      .subscribe();
  }

  /**
   * Record event
   * @param event - Record event message
   */
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

  /**
   * Getter giving the information if file management is enabled.
   * @returns True if file management is enabled.
   */
  get filesEnabled(): boolean {
    return this.config?.files?.enabled ?? false;
  }

  /**
   * Delete the record and go back to previous page.
   * @param event - DOM event
   * @param element - string (PID to remove) or object
   */
  deleteRecord(element: RecordData | string): void {
    const pid = typeof element === 'object' ? element.id : element;
    this.recordUiService
      .deleteRecord(this.type(), pid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: boolean) => {
        if (result === true) {
          let redirectUrl = '../..';
          const navigateOptions = { relativeTo: this.route };
          if (typeof element === 'object' && this.config?.redirectUrl) {
            this.config
              .redirectUrl(element, 'delete')
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

  /**
   * Show a modal containing message given in parameter.
   * @param message - message to display into modal
   */
  showDeleteMessage(message: string): void {
    this.recordUiService.showDeleteMessage(message);
  }

  /** Dynamically load component depending on selected resource type. */
  private loadRecordView(): void {
    this.viewContainerRef.clear();
    this.viewContainerRef.createComponent(this._viewComponent() || DefaultDetailComponent, {
      bindings: [
        inputBinding('record$', () => this.record$),
        inputBinding('type', () => this.route.snapshot.paramMap.get('type')),
      ],
    });
  }

  /** Load component view corresponding to type */
  private loadViewComponentRef() {
    if (!this.route.snapshot.data.types || this.route.snapshot.data.types.length === 0) {
      throw new Error('Configuration types not passed to component');
    }

    const type = this.route.snapshot.paramMap.get('type');
    const { types } = this.route.snapshot.data as { types: DetailViewConfig[] };
    const index = types.findIndex((item) => item.key === type);

    if (index === -1) {
      throw new Error(`Configuration not found for type "${type}"`);
    }

    if (types[index].detailComponent) {
      let detailComponent$ = types[index].detailComponent;

      if (isObservable(detailComponent$) === false) {
        detailComponent$ = of(detailComponent$);
      }

      detailComponent$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((component: Type<unknown>) => {
        this._viewComponent.set(component);
      });
    }
  }
}
