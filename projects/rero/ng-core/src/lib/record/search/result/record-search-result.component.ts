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
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { RecordSearchResultDirective } from './record-search-result.directive';
import { JsonComponent } from './item/json.component';
import { DialogService } from '../../../dialog/dialog.service';
import { DeleteRecordStatus } from '../../record-status';
import { _ } from '../../../utils/utils';

@Component({
  selector: 'ng-core-record-search-result',
  templateUrl: './record-search-result.component.html',
})
export class RecordSearchResultComponent implements OnInit {
  /**
   * Store current URL to come back to the same page
   */
  currentUrl: string = null;

  canDeleteResult: DeleteRecordStatus;

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
  canDelete: Observable<DeleteRecordStatus>;

  /**
   * Indicates if the component is included in angular routes
   */
  @Input()
  inRouting = false;

  /**
   * URL to notice detail
   */
  @Input()
  detailUrl: string = null;

  /**
   * Return detail URL with replaced placeholders.
   */
  get formattedDetailUrl() {
    return this.detailUrl.replace(':type', this.type).replace(':pid', this.record.id);
  }

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
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private dialogService: DialogService,
    private translate: TranslateService,
  ) {
    this.currentUrl = window.location.href;
  }

  /**
   * Component init
   */
  ngOnInit() {
    this.loadItemView();

    if (this.canDelete) {
      this.canDelete.subscribe((result: DeleteRecordStatus) => {
        this.canDeleteResult = result;
      });
    }
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
    (componentRef.instance as JsonComponent).type = this.type;
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

  /**
   * Show dialog with the reason why record cannot be deleted.
   * @param event - Event
   * @param message - string, message to display
   */
  public showDeleteMessage(event: Event, message: string) {
    event.preventDefault();
    this.dialogService.show({
      initialState: {
        title: this.translate.instant(_('Confirmation')),
        body: message,
        confirmButton: false,
        cancelTitleButton: this.translate.instant(_('OK'))
      }
    }).subscribe();
  }
}
