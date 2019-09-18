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
import { zip } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { RecordDetailDirective } from './detail.directive';
import { JsonComponent } from './view/json.component';
import { RecordService } from '../record.service';

@Component({
  selector: 'ng-core-record-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  /**
   * View component for displaying record
   */
  @Input()
  viewComponent: any = null;

  /**
   * Record to display
   */
  record: any = null;

  /**
   * Error message
   */
  error: string = null;

  /**
   * Directive for displaying record
   */
  @ViewChild(RecordDetailDirective, { static: true }) recordDetail: RecordDetailDirective;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private componentFactoryResolver: ComponentFactoryResolver,
    private recordService: RecordService
  ) { }

  /**
   * On init hook
   */
  ngOnInit() {
    this.loadViewComponentRef();
    this.getRecord();
  }

  /**
   * Go back to previous page
   * @param event - Event, DOM event
   */
  public goBack(event: Event) {
    event.preventDefault();
    this.location.back();
  }

  /**
   * Load record from API
   */
  private getRecord() {
    const pid = this.route.snapshot.paramMap.get('pid');
    const type = this.route.snapshot.paramMap.get('type');

    this.recordService.getRecord(type, pid)
      .subscribe(
        (record) => {
          this.record = record;
          this.loadRecordView();
        },
        (error) => {
          this.error = error;
        }
      );
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
    (componentRef.instance as JsonComponent).record = this.record;
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
