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
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DetailUrl, RecordData, ResultItem } from '@rero/ng-core';
import { Tag } from 'primeng/tag';

export interface DocumentMetadata {
  pid: string;
  type: {
    main_type: string;
  }[];
  title: {
    mainTitle: {
      value: string;
    }[];
  }[];
}

/**
 * Component for displaying a document brief view.
 */
@Component({
    templateUrl: './document.component.html',
    imports: [RouterLink, Tag],
})
export class DocumentComponent implements ResultItem<RecordData<DocumentMetadata>> {
  // Record data.
  record = input.required<RecordData<DocumentMetadata>>();

  // Type of resource.
  type = input.required<string>();

  // Info for detail URL link.
  detailUrl = input<DetailUrl>();
}
