/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
