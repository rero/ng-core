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
import { Location } from '@angular/common';
import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { ActionStatus } from '../action-status';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { RecordDetailDirective } from './detail.directive';
import { JsonComponent } from './view/json.component';

@Component({
  selector: 'ng-core-record-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  /**
   * Object for checking record deletion permission.
   */
  deleteStatus: ActionStatus = {
    can: true,
    message: ''
  };

  /**
   * Record can be updated ?
   */
  updateStatus: ActionStatus = {
    can: true,
    message: ''
  };

  /**
   * Observable resolving record data
   */
  record$: Observable<any> = null;

  /**
   * Record data
   */
  record: any = null;

  /**
   * Error message
   */
  error: string = null;

  /**
   * Admin mode for CRUD operations
   */
  adminMode: ActionStatus = {
    can: true,
    message: ''
  };

  /**
   * View component for displaying record
   */
  @Input()
  viewComponent: any = null;

  /**
   * Directive for displaying record
   */
  @ViewChild(RecordDetailDirective, { static: true })
  recordDetail: RecordDetailDirective;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _recordService: RecordService,
    private _recordUiService: RecordUiService,
    private _toastrService: ToastrService,
    private _translate: TranslateService
  ) { }

  /**
   * On init hook
   */
  ngOnInit() {
    this.loadViewComponentRef();

    const pid = this._route.snapshot.paramMap.get('pid');
    const type = this._route.snapshot.paramMap.get('type');

    this._recordUiService.types = this._route.snapshot.data.types;
    const config = this._recordUiService.getResourceConfig(type);

    this.record$ = this._recordService.getRecord(type, pid, 1, config.itemHeaders || null);
    this.record$.subscribe(
      (record) => {
        this.record = record;

        this._recordUiService.canReadRecord$(this.record, type).subscribe(result => {
          if (result.can === false) {
            this._toastrService.error(
              this._translate.instant('You cannot read this record'),
              this._translate.instant(type)
            );
            this._location.back();
          }
        });

        this._recordUiService.canDeleteRecord$(this.record, type).subscribe(result => {
          this.deleteStatus = result;
        });

        this._recordUiService.canUpdateRecord$(this.record, type).subscribe(result => {
          this.updateStatus = result;
        });

        if (this._route.snapshot.data.adminMode) {
          this._route.snapshot.data.adminMode().subscribe((am: ActionStatus) => this.adminMode = am);
        }
      },
      (error) => {
        this.error = error;
      }
    );

    this.loadRecordView();
  }

  /**
   * Go back to previous page
   */
  goBack() {
    this._location.back();
  }

  /**
   * Delete the record and go back to previous page.
   * @param event - DOM event
   * @param pid - string, PID to remove
   */
  deleteRecord(pid: string) {
    this._recordUiService.deleteRecord(this._route.snapshot.paramMap.get('type'), pid).subscribe((result: any) => {
      if (result === true) {
        this._router.navigate(['../..'], {relativeTo: this._route});
      }
    });
  }

  /**
   * Show a modal containing message given in parameter.
   * @param event - DOM event
   * @param message - message to display into modal
   */
  showDeleteMessage(message: string) {
    this._recordUiService.showDeleteMessage(message);
  }

  /**
   * Dynamically load component depending on selected resource type.
   */
  private loadRecordView() {
    const componentFactory = this._componentFactoryResolver
      .resolveComponentFactory(this.viewComponent ? this.viewComponent : JsonComponent);
    const viewContainerRef = this.recordDetail.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as JsonComponent).record$ = this.record$;
    (componentRef.instance as JsonComponent).type = this._route.snapshot.paramMap.get('type');
  }

  /**
   * Load component view corresponding to type
   */
  private loadViewComponentRef() {
    if (!this._route.snapshot.data.types || this._route.snapshot.data.types.length === 0) {
      throw new Error('Configuration types not passed to component');
    }

    const type = this._route.snapshot.paramMap.get('type');
    const types = this._route.snapshot.data.types;

    const index = types.findIndex((item: any) => item.key === type);

    if (index === -1) {
      throw new Error(`Configuration not found for type "${type}"`);
    }

    if (types[index].detailComponent) {
      this.viewComponent = types[index].detailComponent;
    }
  }
}
