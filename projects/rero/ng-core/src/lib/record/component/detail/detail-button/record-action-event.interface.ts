// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { RecordData } from '../../../../model/record.interface';

export type RecordActionEvent =
  | {
      action: 'use';
      url?: string;
    }
  | {
      action: 'update';
      record: RecordData;
    }
  | {
      action: 'delete';
      record: RecordData;
    };
