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
import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';

import { RecordDetailDirective } from './detail.directive';
import { JsonComponent } from './view/json.component';
import { RecordService } from '../record.service';
import { ActionStatus } from '../action-status';
import { RecordUiService } from '../record-ui.service';
import { Action } from 'rxjs/internal/scheduler/Action';

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
   * View component for displaying record
   */
  @Input()
  viewComponent: any = null;

  /**
   * Directive for displaying record
   */
  @ViewChild(RecordDetailDirective, { static: true }) recordDetail: RecordDetailDirective;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private componentFactoryResolver: ComponentFactoryResolver,
    private recordService: RecordService,
    private recordUiService: RecordUiService
  ) { }

  /**
   * On init hook
   */
  ngOnInit() {
    this.loadViewComponentRef();

    const pid = this.route.snapshot.paramMap.get('pid');
    const type = this.route.snapshot.paramMap.get('type');

    this.record$ = this.recordService.getRecord(type, pid, 1);
    this.record$.subscribe(
      (record) => {
        this.record = record;

        const config = this.recordUiService.getResourceConfig(this.route.snapshot.data.types, type);

        if (config.canDelete) {
          config.canDelete(this.record).subscribe((result: ActionStatus) => {
            this.deleteStatus = result;
          });
        }

        if (config.canUpdate) {
          config.canUpdate(this.record).subscribe((result: ActionStatus) => {
            this.updateStatus = result;
          });
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
  public goBack() {
    this.location.back();
  }

  /**
   * Delete the record and go back to previous page.
   * @param event - DOM event
   * @param pid - string, PID to remove
   */
  public deleteRecord(pid: string) {
    this.recordUiService.deleteRecord(pid, this.route.snapshot.paramMap.get('type')).subscribe((result: any) => {
      if (result === true) {
        this.location.back();
      }
    });
  }

  /**
   * Show a modal containing message given in parameter.
   * @param event - DOM event
   * @param message - message to display into modal
   */
  public showDeleteMessage(message: string) {
    this.recordUiService.showDeleteMessage(message);
  }

  /**
   * Dynamically load component depending on selected resource type.
   */
  private loadRecordView() {
    const componentFactory = this.componentFactoryResolver
      .resolveComponentFactory(this.viewComponent ? this.viewComponent : JsonComponent);
    const viewContainerRef = this.recordDetail.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as JsonComponent).record$ = this.record$;
    (componentRef.instance as JsonComponent).type = this.route.snapshot.paramMap.get('type');
  }

  /**
   * Load component view corresponding to type
   */
  private loadViewComponentRef() {
    if (!this.route.snapshot.data.types || this.route.snapshot.data.types.length === 0) {
      throw new Error('Configuration types not passed to component');
    }

    const type = this.route.snapshot.paramMap.get('type');
    const types = this.route.snapshot.data.types;

    const index = types.findIndex((item: any) => item.key === type);

    if (index === -1) {
      throw new Error(`Configuration not found for type "${type}"`);
    }

    if (types[index].detailComponent) {
      this.viewComponent = types[index].detailComponent;
    }
  }
}
