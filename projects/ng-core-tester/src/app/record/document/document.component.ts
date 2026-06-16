// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
