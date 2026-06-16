// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AbstractControl } from '@angular/forms';
import { RecordService } from '../../record/service/record/record.service';

// @dynamic
export class UniqueValidator {
  static createValidator(recordService: RecordService, recordType: string, fieldName: string, excludePid?: string) {
    return (control: AbstractControl) => {
      return recordService.valueAlreadyExists(recordType, fieldName, control.value, excludePid);
    };
  }
}
