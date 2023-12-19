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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionStatus } from '../../action-status';
import { IRecordEvent } from './IRecordEvent.interface';

@Component({
  selector: 'ng-core-detail-button',
  templateUrl: './detail-button.component.html'
})
export class DetailButtonComponent {

  /** Record */
  @Input() record: any;

  /** Record type */
  @Input() type: string;

  /** Admin mode for CRUD operations */
  @Input() adminMode: ActionStatus = { can: false, message: '' };

  /** Record can be used ? */
  @Input() useStatus: ActionStatus = { can: false, message: '', url: '' };

  /** Record can be updated ? */
  @Input() updateStatus: ActionStatus = { can: false, message: '' };

  /** Record can be deleted ? */
  @Input() deleteStatus: ActionStatus = { can: false, message: '' };

  /** Record event */
  @Output() recordEvent = new EventEmitter<IRecordEvent>();

  /** Delete record message event */
  @Output() deleteMessageEvent = new EventEmitter<string>();

  /**
   * Constructor
   * @param location - Location
   */
  constructor(private location: Location) { }

  /**
   * define if an action is the primary action for the resource
   * @param actionName - string: the action name to check
   * @return boolean
   */
  isPrimaryAction(actionName: string): boolean {
    switch (actionName) {
      case 'edit':
      case 'update':
        return this.updateStatus && this.updateStatus.can && (!this.useStatus || !this.useStatus.can);
      case 'use':
        return this.useStatus && this.useStatus.can;
      default:
        return false;
    }
  }

  /** Use the record */
  useRecord(): void {
    this.recordEvent.emit({ action: 'use', url: this.updateStatus.url })
  }

  /**
   * Update record event
   * @param record - the current record
   */
  updateRecord(record: any): void {
    this.recordEvent.emit({ action: 'update', record });
  }

  /**
   * Delete record event
   * @param record - the current record
   */
  deleteRecord(record: any): void {
    this.recordEvent.emit({ action: 'delete', record });
  }

  /**
   * Show a modal containing message given in parameter.
   * @param message - message to display into modal
   */
  showDeleteMessage(message: string) {
    this.deleteMessageEvent.emit(message);
  }

  /** Go back to previous page */
  goBack() {
    this.location.back();
  }
}
