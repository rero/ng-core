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
import { Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ActionStatus } from '../../action-status';
import { JsonComponent } from './item/json.component';
import { ResultItem } from './item/result-item';
import { RecordSearchResultDirective } from './record-search-result.directive';


@Component({
  selector: 'ng-core-record-search-result',
  templateUrl: './record-search-result.component.html',
})
export class RecordSearchResultComponent implements OnInit {
  /**
   * Store current URL to come back to the same page
   */
  currentUrl: string = null;

  /**
   * Store if record can be deleted or not
   */
  deleteStatus: ActionStatus;

  /**
   * Store if record can be updated or not
   */
  updateStatus: ActionStatus;

  /**
   * Store if record can be use or not
   */
  useStatus: ActionStatus;

  /**
   * Detail URL value, resolved by observable property detailUrl$.
   */
  detailUrl: { link: string, external: boolean };

  /**
   * Record to display
   */
  @Input()
  record: { id: string, metadata: { pid: string } };

  /**
   * Type of record
   */
  @Input()
  type: string;

  /**
   * Component for displaying item view
   */
  @Input()
  itemViewComponent: any;

  /**
   * Admin mode (edit, remove, add, ...)
   */
  @Input()
  adminMode: ActionStatus = {
    can: false,
    message: ''
  };

  /**
   * Record can be updated
   */
  @Input()
  canUpdate$: Observable<ActionStatus>;

  /**
   * Record can be removed
   */
  @Input()
  canDelete$: Observable<ActionStatus>;

  /**
   * Record can be used (mainly for templates)
   */
  @Input()
  canUse$: Observable<ActionStatus>;

  /**
   * Aggregations
   */
  @Input()
  aggregations: Array<object>;

  /**
   * Observable emitting current value of record URL.
   */
  @Input()
  detailUrl$: Observable<{ link: string, external: boolean }> = null;

  /**
   * Event emitted when a record is deleted
   */
  @Output() deletedRecord = new EventEmitter<string>();

  /**
   * Directive for displaying search results
   */
  @ViewChild(RecordSearchResultDirective, { static: true }) searchResultItem: RecordSearchResultDirective;


  /**
   * Return a message containing the reasons why the item cannot be deleted
   */
  get deleteInfoMessage(): string {
    return this.deleteStatus.message;
  }

  /**
   * Constructor.
   *
   * @param _componentFactoryResolver Component factory resolver.
   * @param _router: Router
   */
  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _router: Router
  ) {
    this.currentUrl = window.location.href;
  }

  /**
   * Component init
   */
  ngOnInit() {
    if (this.canDelete$) {
      this.canDelete$.subscribe((result: ActionStatus) => {
        this.deleteStatus = result;
      });
    }

    if (this.canUpdate$) {
      this.canUpdate$.subscribe((result: ActionStatus) => {
        this.updateStatus = result;
      });
    }

    if (this.canUse$) {
      this.canUse$.subscribe((result: ActionStatus) => {
        this.useStatus = result;
      });
    }

    if (this.detailUrl$) {
      this.detailUrl$.subscribe((url: { link: string, external: boolean }) => {
        this.detailUrl = url;
      });
    }

    this.loadItemView();
  }

  /**
   * Dynamically load component depending on selected resource type.
   */
  loadItemView() {
    const componentFactory = this._componentFactoryResolver
      .resolveComponentFactory(this.itemViewComponent ? this.itemViewComponent : JsonComponent);
    const viewContainerRef = this.searchResultItem.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as ResultItem).record = this.record;
    (componentRef.instance as ResultItem).type = this.type;
    (componentRef.instance as ResultItem).detailUrl = this.detailUrl;
  }

  /**
   * Delete a record
   * @param pid - string, pid to delete
   */
  deleteRecord(pid: string) {
    return this.deletedRecord.emit(pid);
  }

  /**
   * Edit a record
   * @param pid - string: the pid to edit
   */
  editRecord(pid: string) {
    this._router.navigate(['/', 'records', this.type, 'edit', pid]);
  }

  /**
   * Use a record
   */
  useRecord() {
    this._router.navigateByUrl(this.useStatus.url);
  }
}
