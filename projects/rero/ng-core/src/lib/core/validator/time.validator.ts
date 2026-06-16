// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AbstractControl, UntypedFormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DateTime } from 'luxon';

// @dynamic
export class TimeValidator {
  static readonly FORMAT = 'hh:mm';

  /**
   * Allow to control if time interval limits are well formed : the end limit should be 'older' the start limit
   * @param start: the field name where to find the start limit value
   * @param end: the field name where to find the end limit value
   */
  static greaterThanValidator(start: string, end: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startTime = control.get(start);
      const endTime = control.get(end);
      if (control && startTime && endTime) {
        let isLessThan = false;
        const startDate = DateTime.fromFormat(startTime.value, TimeValidator.FORMAT);
        const endDate = DateTime.fromFormat(endTime.value, TimeValidator.FORMAT);
        if (
          startDate.toFormat(TimeValidator.FORMAT) !== '00:00' ||
          endDate.toFormat(TimeValidator.FORMAT) !== '00:00'
        ) {
          isLessThan = startDate >= endDate;
        }
        return isLessThan ? { lessThan: { value: isLessThan } } : null;
      }
      return null;
    };
  }

  static RangePeriodValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        let isRangeLessThan = false;
        const times = control.get('times') as UntypedFormArray;
        if (control.get('is_open')?.value && times && times.value.length > 1) {
          const firstStartDate = DateTime.fromFormat(times.at(0).get('start_time')?.value, TimeValidator.FORMAT);
          const firstEndDate = DateTime.fromFormat(times.at(0).get('end_time')?.value, TimeValidator.FORMAT);
          const lastStartDate = DateTime.fromFormat(times.at(1).get('start_time')?.value, TimeValidator.FORMAT);
          const lastEndDate = DateTime.fromFormat(times.at(1).get('end_time')?.value, TimeValidator.FORMAT);
          if (firstStartDate > lastStartDate) {
            isRangeLessThan = firstStartDate <= lastStartDate || firstStartDate <= lastEndDate;
          } else {
            isRangeLessThan = lastStartDate <= firstEndDate || lastStartDate <= firstEndDate;
          }
        }
        return isRangeLessThan ? { rangeLessThan: { value: isRangeLessThan } } : null;
      }
      return null;
    };
  }
}
