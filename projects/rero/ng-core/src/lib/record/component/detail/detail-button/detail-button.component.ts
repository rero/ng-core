// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ActionStatus } from '../../../../model/action-status.interface';
import { RecordActionEvent } from './record-action-event.interface';
import { Button } from 'primeng/button';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { Tooltip } from 'primeng/tooltip';
import { RecordData } from '../../../../model/record.interface';

@Component({
  selector: 'ng-core-detail-button',
  templateUrl: './detail-button.component.html',
  imports: [Button, TranslateDirective, Tooltip, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailButtonComponent {
  // Inject
  location: Location = inject(Location);

  /** Record */
  record = input<RecordData | null>(null);

  /** Record type */
  type = input<string>('');

  /** Admin mode for CRUD operations */
  adminMode = input(false);

  /** Record can be used ? */
  useStatus = input<ActionStatus>({ can: false, message: '', url: '' });

  /** Record can be updated ? */
  updateStatus = input<ActionStatus>({ can: false, message: '' });

  /** Record can be deleted ? */
  deleteStatus = input<ActionStatus>({ can: false, message: '' });

  /** Record event */
  recordEvent = output<RecordActionEvent>();

  /** Delete record message event */
  deleteMessageEvent = output<string>();

  /** Use the record */
  useRecord(): void {
    this.recordEvent.emit({ action: 'use', url: this.useStatus().url });
  }

  /**
   * Update record event
   * @param record - the current record
   */
  updateRecord(record: RecordData): void {
    this.recordEvent.emit({ action: 'update', record });
  }

  /**
   * Delete record event
   * @param record - the current record
   */
  deleteRecord(record: RecordData): void {
    if (this.deleteStatus().can) {
      this.recordEvent.emit({ action: 'delete', record });
    } else {
      this.deleteMessageEvent.emit(this.deleteStatus().message.replace(new RegExp('\\n', 'g'), '<br>'));
    }
  }

  /** Go back to previous page */
  goBack(): void {
    this.location.back();
  }
}
