// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { JsonObject } from '../model';
import { RecordType } from '../record/model';

export interface RouteDataTypesInterface<TMetadata = JsonObject> {
  /** Route name */
  readonly name: string;

  /** Get record types exposed by the current route */
  getTypes(): Partial<RecordType<TMetadata>>[];
}
