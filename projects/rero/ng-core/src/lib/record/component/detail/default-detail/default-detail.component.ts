// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RecordData } from '../../../../model/record.interface';
import { DetailRecord } from '../detail-record.interface';

/**
 * Component to display a record by dumping its data to JSON.
 */
@Component({
  template: `
    @if (record()) {
      <h1>Record of type "{{ type() }}" #{{ record()!.id }}</h1>
      <pre>
        <div style="white-space: pre-wrap;">{{ record()|json }}</div>
      </pre>
    }
  `,
  imports: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultDetailComponent implements DetailRecord {
  // Record data
  record = input.required<RecordData | undefined>();

  // Resource type
  type = input.required<string>();
}
