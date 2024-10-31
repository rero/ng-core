/*
 * RERO angular core
 * Copyright (C) 2019-2024 RERO
 * Copyright (C) 2019-2023 UCLouvain
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
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ActionStatus } from '../../action-status';
import { JsonComponent } from './item/json.component';
import { ResultItem } from './item/result-item';

export interface IDeleteRecordEvent {
  pid: string;
  type?: string | undefined | null
}

@Component({
  selector: 'ng-core-record-search-result',
  templateUrl: './record-search-result.component.html',
})
export class RecordSearchResultComponent implements OnInit, AfterViewInit {

  protected changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  protected router: Router = inject(Router);

  // Store current URL to come back to the same page
  currentUrl: string = null;

  // Store if record can be deleted or not
  deleteStatus: ActionStatus;

  // Store if record can be updated or not
  updateStatus: ActionStatus;

  // Store if record can be use or not
  useStatus: ActionStatus;

  // Detail URL value, resolved by observable property detailUrl$.
  detailUrl: { link: string, external: boolean };

  // Record to display
  @Input() record: { id: string, metadata: { pid: string } };

  // Type of record
  @Input() type: string;

  // Component for displaying item view
  @Input() itemViewComponent: any;

  // Admin mode (edit, remove, add, ...)
  @Input() adminMode: ActionStatus = { can: false, message: '' };

  // Record can be updated
  @Input() canUpdate$: Observable<ActionStatus>;

  // Record can be removed
  @Input() canDelete$: Observable<ActionStatus>;

  // Record can be used (mainly for templates)
  @Input() canUse$: Observable<ActionStatus>;

  // Aggregations
  @Input() aggregations: Array<object>;

  // Observable emitting current value of record URL.
  @Input() detailUrl$: Observable<{ link: string, external: boolean }> = null;

  // Event emitted when a record is deleted
  @Output() deletedRecord = new EventEmitter<IDeleteRecordEvent>();

  @Output() deleteMessageEvent = new EventEmitter<string>();

  // Location for component item creation
  @ViewChild('item', { read: ViewContainerRef }) container!: ViewContainerRef;

  // Return a message containing the reasons why the item cannot be deleted
  get deleteInfoMessage(): string {
    return this.deleteStatus.message;
  }

  // OnInit hook
  ngOnInit() {
    this.currentUrl = window.location.href;
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
  }

  // AfterViewInit hook
  ngAfterViewInit(): void {
    this.container.clear();
    const component = this.container.createComponent(this.itemViewComponent || JsonComponent);
    (component.instance as ResultItem).record = this.record;
    (component.instance as ResultItem).type = this.type;
    (component.instance as ResultItem).detailUrl = this.detailUrl;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Delete a record
   * @param pid - string, pid to delete
   * @param type - string, resource type
   */
  deleteRecord(pid: string, type?: string): void {
    if (this.deleteStatus.can) {
      this.deletedRecord.emit({ pid, type });
    } else {
      this.deleteMessageEvent.emit(this.deleteStatus.message.replace(new RegExp('\n', 'g'), '<br>'));
    }
  }

  /**
   * Edit a record
   * @param pid - string: the pid to edit
   */
  editRecord(pid: string, url?: string[]): void {
    const params = url ?? ['/', 'records', this.type, 'edit', pid];
    this.router.navigate(params);
  }

  /**
   * Use a record
   */
  useRecord() {
    this.router.navigateByUrl(this.useStatus.url);
  }
}
