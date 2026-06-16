// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { JsonPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { DetailRecord, RecordData } from '@rero/ng-core';

/**
 * Component for displaying the detail of a document.
 */
@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  imports: [JsonPipe],
})
export class DetailComponent implements DetailRecord {
  // Record data
  record = input.required<RecordData | undefined>();

  // Resource type
  type = input.required<string>();
}
