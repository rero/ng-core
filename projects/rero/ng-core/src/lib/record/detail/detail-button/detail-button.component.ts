/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { Component, inject, input, output } from '@angular/core';
import { ActionStatus } from '../../action-status';
import { IRecordEvent } from './IRecordEvent.interface';

@Component({
  selector: 'ng-core-detail-button',
  templateUrl: './detail-button.component.html'
})
export class DetailButtonComponent {

  // Inject
  location: Location = inject(Location);

  /** Record */
  record = input<any>();

  /** Record type */
  type = input<string>();

  /** Admin mode for CRUD operations */
  adminMode = input<ActionStatus>({ can: false, message: '' });

  /** Record can be used ? */
  useStatus = input<ActionStatus>({ can: false, message: '', url: '' });

  /** Record can be updated ? */
  updateStatus = input<ActionStatus>({ can: false, message: '' });

  /** Record can be deleted ? */
  deleteStatus = input<ActionStatus>({ can: false, message: '' });

  /** Record event */
  recordEvent = output<IRecordEvent>();

  /** Delete record message event */
  deleteMessageEvent = output<string>();

  /**
   * define if an action is the primary action for the resource
   * @param actionName - string: the action name to check
   * @return boolean
   */
  isPrimaryAction(actionName: string): boolean {
    switch (actionName) {
      case 'edit':
      case 'update':
        return this.updateStatus() && this.updateStatus().can && (!this.useStatus() || !this.useStatus().can);
      case 'use':
        return this.useStatus() && this.useStatus().can;
      default:
        return false;
    }
  }

  /** Use the record */
  useRecord(): void {
    this.recordEvent.emit({ action: 'use', url: this.updateStatus().url })
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
    if (this.deleteStatus().can) {
      this.recordEvent.emit({ action: 'delete', record });
    } else {
      this.deleteMessageEvent.emit(this.deleteStatus().message.replace(new RegExp('\n', 'g'), '<br>'));
    }
  }

  /** Go back to previous page */
  goBack() {
    this.location.back();
  }
}
