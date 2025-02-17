/*
 * RERO angular core
 * Copyright (C) 2020-2023 RERO
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
import { Component, inject, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { catchError, isObservable, Observable, of, Subscription, tap } from 'rxjs';
import { Error } from '../../error/error';
import { ActionStatus } from '../action-status';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { IRecordEvent } from './detail-button/IRecordEvent.interface';
import { RecordDetailDirective } from './detail.directive';
import { JsonComponent } from './view/json.component';

@Component({
    selector: 'ng-core-record-detail',
    templateUrl: './detail.component.html',
    standalone: false
})
export class DetailComponent implements OnInit, OnDestroy {

  protected route: ActivatedRoute = inject(ActivatedRoute);
  protected router: Router = inject(Router);
  protected location: Location = inject(Location);
  protected recordService: RecordService = inject(RecordService);
  protected recordUiService: RecordUiService = inject(RecordUiService);
  protected translate: TranslateService = inject(TranslateService);
  protected spinner: NgxSpinnerService = inject(NgxSpinnerService);
  protected messageService: MessageService = inject(MessageService);

  protected viewContainerRef: ViewContainerRef = inject(ViewContainerRef);


  /** View component for displaying record */
  @Input() viewComponent: any = null;

  /** Record can be used ? */
  useStatus: ActionStatus = { can: false, message: '', url: '' };

  /** Record can be updated ? */
  updateStatus: ActionStatus = { can: false, message: '' };

  /** Record can be deleted ? */
  deleteStatus: ActionStatus = { can: false, message: '' };

  /** Observable resolving record data */
  record$: Observable<any> = null;

  /** Record data */
  record: any = null;

  /** Error message */
  error: Error;

  /** Admin mode for CRUD operations */
  adminMode: ActionStatus = { can: true, message: '' };

  /** Type of record */
  type: string;

  /**Subscription to route parameters observables */
  private routeParametersSubscription: Subscription;

  /** Object type route config */
  private config: any = null;

  // Subscription to detail component view observable.
  private detailComponentSubscription: Subscription;

  /** Directive for displaying record */
  @ViewChild(RecordDetailDirective, { static: true })
  recordDetail: RecordDetailDirective;

  /** On init hook */
  ngOnInit() {
    this.routeParametersSubscription = this.route.paramMap.subscribe(() => {
      this.spinner.show();

      this.loadViewComponentRef();

      const pid = this.route.snapshot.paramMap.get('pid');
      this.type = this.route.snapshot.paramMap.get('type');

      this.recordUiService.types = this.route.snapshot.data.types;
      this.config = this.recordUiService.getResourceConfig(this.type);

      const type = this.config.index || this.config.key;
      this.record$ = this.recordService.getRecord(type, pid, 1, this.config.itemHeaders || null).pipe(
        catchError((error) => {
          this.error = error;
          this.spinner.hide();
          return of(null);
        }),
        tap(record => {
          this.record = record;
          this.recordUiService.canReadRecord$(this.record, this.type).subscribe(result => {
            if (result.can === false) {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant(this.type),
                detail: this.translate.instant('You cannot read this record'),
                sticky: true,
                closable: true
              })
              this.location.back();
            }
          });
          this.recordUiService.canDeleteRecord$(this.record, this.type).subscribe(result => {
            this.deleteStatus = result;
          });

          this.recordUiService.canUpdateRecord$(this.record, this.type).subscribe(result => {
            this.updateStatus = result;
          });

          this.recordUiService.canUseRecord$(this.record, this.type).subscribe(result => {
            this.useStatus = result;
          });

          if (this.route.snapshot.data.adminMode) {
            this.route.snapshot.data.adminMode().subscribe((am: ActionStatus) => this.adminMode = am);
          }

          this.spinner.hide();
        })
      );
      this.loadRecordView();
    });
  }

  /**
   * Component destruction.
   *
   * Unsubscribes from the observables of the route parameters.
   * Unsubscribes from the observable for detail view.
   */
  ngOnDestroy(): void {
    this.routeParametersSubscription.unsubscribe();

    if (this.detailComponentSubscription) {
      this.detailComponentSubscription.unsubscribe();
    }
  }

  /**
   * Record event
   * @param event - Record event message
   */
  recordEvent(event: IRecordEvent): void {
    switch(event.action) {
      case 'use':
        this.router.navigateByUrl(event.url);
      break;
      case 'update':
        this.router.navigate(
          ['../../edit', event.record.id],
          { relativeTo: this.route, replaceUrl: true }
        );
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
    return this.config.files && this.config.files.enabled ? this.config.files.enabled : false;
  }

  /**
   * Delete the record and go back to previous page.
   * @param event - DOM event
   * @param element - string (PID to remove) or object
   */
  deleteRecord(element: any) {
    const pid = typeof element === 'object' ? element.id : element;
    return this.recordUiService.deleteRecord(this.type, pid).subscribe((result: any) => {
      if (result === true) {
        let redirectUrl = '../..';
        const navigateOptions = { relativeTo: this.route };
        if (typeof element === 'object' && this.config.redirectUrl) {
          this.config.redirectUrl(element, 'delete').subscribe((redirect: string) => {
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
    const componentRef = this.viewContainerRef.createComponent(this.viewComponent || JsonComponent);
    (componentRef.instance as JsonComponent).record$ = this.record$;
    (componentRef.instance as JsonComponent).type = this.route.snapshot.paramMap.get('type');
  }

  /** Load component view corresponding to type */
  private loadViewComponentRef() {
    if (!this.route.snapshot.data.types || this.route.snapshot.data.types.length === 0) {
      throw new Error('Configuration types not passed to component');
    }

    const type = this.route.snapshot.paramMap.get('type');
    const { types } = this.route.snapshot.data;
    const index = types.findIndex((item: any) => item.key === type);

    if (index === -1) {
      throw new Error(`Configuration not found for type "${type}"`);
    }

    if (types[index].detailComponent) {
      let detailComponent$ = types[index].detailComponent;

      if (isObservable(detailComponent$) === false) {
        detailComponent$ = of(detailComponent$);
      }

      this.detailComponentSubscription = detailComponent$.subscribe(
        (component: any) => {
          this.viewComponent = component;
        }
      );
    }
  }
}
