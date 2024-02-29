/*
 * RERO angular core
 * Copyright (C) 2023-2024 RERO
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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { RecordUiService } from '../../record-ui.service';
import { Subscription, of } from 'rxjs';
import { ActionStatus } from '../../action-status';

@Component({
  selector: 'ng-core-record-file',
  templateUrl: './file.component.html',
})
export class FileComponent implements OnInit, OnDestroy {
  // record data
  @Input() record: any;

  // record file data
  @Input() file: any;

  // record type
  @Input() type: any;

  // true if the file has old versions
  @Input() hasChildren: boolean;

  // list of fields to not display
  @Input() infoExcludedFields: Array<string> = [];

  // event emitter when the delete button is clicked
  @Output() deleteFile: EventEmitter<void> = new EventEmitter();

  // event emitter when the edit metadata button is clicked
  @Output() manageFile: EventEmitter<void> = new EventEmitter();

  // event emitter when edit button is clicked
  @Output() editMetadataFile: EventEmitter<void> = new EventEmitter();

  // permissions
  canUpdateMetadata: ActionStatus;
  canUpdate: ActionStatus;
  canDelete: ActionStatus;

  // subscriptions to observables
  private _subscriptions: Subscription = new Subscription();

  /**
   * Constructor.
   *
   * @param recordUiService RecordUiService.
   */
  constructor(private recordUiService: RecordUiService) {}

  /**
   * hook OnInit
   */
  ngOnInit(): void {
    this.loadPermission();
  }

  /**
   * Loads the permissions.
   */
  loadPermission() {
    const config = this.recordUiService.getResourceConfig(this.type);
    let obs$ = config.files.canUpdate
      ? config.files.canUpdate(this.record, this.file)
      : of({ can: false, message: '' });
    this._subscriptions.add(
      obs$.subscribe((result: ActionStatus) => {
        this.canUpdate = result;
      })
    );
    obs$ = config.files.canDelete ? config.files.canDelete(this.record, this.file) : of({ can: false, message: '' });
    this._subscriptions.add(
      obs$.subscribe((result: ActionStatus) => {
        this.canDelete = result;
      })
    );
    obs$ = config?.files?.canUpdate
      ? config.files.canUpdateMetadata(this.record, this.file)
      : of({ can: false, message: '' });
    this._subscriptions.add(
      obs$.subscribe((result: ActionStatus) => {
        this.canUpdateMetadata = result;
      })
    );
  }

  /**
   * Component destruction.
   */
  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * Delete the file.
   */
  delete() {
    this.deleteFile.emit();
  }

  /**
   * Edit the files.
   */
  manage() {
    this.manageFile.emit();
  }

  /**
   * Edit the metadata.
   */
  editMetadata() {
    this.editMetadataFile.emit();
  }
}
