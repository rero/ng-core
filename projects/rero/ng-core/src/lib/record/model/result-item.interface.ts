// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { InputSignal } from '@angular/core';
import { RecordData } from '../../model/record.interface';

/**
 * Interface representing a result item in search.
 */
export interface ResultItem<TRecordData = RecordData> {
  // Record data.
  record: InputSignal<TRecordData>;

  // Type of resource.
  type: InputSignal<string>;

  // Object containing info about the link to detail.
  detailUrl?: InputSignal<DetailUrl | undefined>;
}

export interface DetailUrl {
  link: string;
  external: boolean;
}
