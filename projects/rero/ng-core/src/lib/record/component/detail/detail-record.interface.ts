// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { InputSignal } from '@angular/core';
import { RecordData } from '../../../model/record.interface';

/**
 * Interface representing a record detail.
 */
export interface DetailRecord {
  // Record data
  record: InputSignal<RecordData | undefined>;

  // Resource type
  type: InputSignal<string>;
}
