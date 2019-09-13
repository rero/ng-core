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
import { Component, Input, ComponentFactoryResolver, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';

import { RecordSearchResultDirective } from './record-search-result.directive';
import { JsonComponent } from './item/json.component';

@Component({
  selector: 'ng-core-record-search-result',
  templateUrl: './record-search-result.component.html',
})
export class RecordSearchResultComponent implements OnInit {
  /**
   * Record to display
   */
  @Input()
  record: { metadata: { pid: string } };

  /**
   * Component for displaying item view
   */
  @Input()
  itemViewComponent: any;

  /**
   * Admin mode (edit, remove, add, ...)
   */
  @Input()
  adminMode = false;

  /**
   * Record can be updated
   */
  @Input()
  canUpdate = true;

  /**
   * Record can be removed
   */
  @Input()
  canDelete = true;

  /**
   * Event emitted when a record is deleted
   */
  @Output() deletedRecord = new EventEmitter<string>();

  /**
   * Directive for displaying search results
   */
  @ViewChild(RecordSearchResultDirective, { static: true }) searchResultItem: RecordSearchResultDirective;

  /**
   * Constructor
   */
  constructor(private componentFactoryResolver: ComponentFactoryResolver, ) { }

  /**
   * Component init
   */
  ngOnInit() {
    this.loadItemView();
  }

  /**
   * Dynamically load component depending on selected resource type.
   */
  public loadItemView() {
    const componentFactory = this.componentFactoryResolver
      .resolveComponentFactory(this.itemViewComponent ? this.itemViewComponent : JsonComponent);
    const viewContainerRef = this.searchResultItem.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as JsonComponent).record = this.record;
  }

  /**
   * Delete a record
   * @param event - Event, dom event fired
   * @param pid - string, pid to delete
   */
  public deleteRecord(event: Event, pid: string) {
    event.preventDefault();
    return this.deletedRecord.emit(pid);
  }
}
