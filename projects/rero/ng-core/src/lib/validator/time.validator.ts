/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import {AbstractControl, UntypedFormArray, ValidationErrors, ValidatorFn} from '@angular/forms';
import { DateTime } from "luxon";

// @dynamic
export class TimeValidator {

  static readonly FORMAT = 'hh:mm';

  /**
   * Allow to control if time interval limits are well formed : the end limit should be 'older' the start limit
   * @param start: the field name where to find the start limit value
   * @param end: the field name where to find the end limit value
   */
  static greaterThanValidator(start: string, end: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors|null => {
      if (control) {
        let isLessThan = false;
        const startTime = control.get(start);
        const endTime = control.get(end);
        const startDate = DateTime.fromFormat(startTime.value, TimeValidator.FORMAT);
        const endDate = DateTime.fromFormat(endTime.value, TimeValidator.FORMAT);
        if (startDate.toFormat(TimeValidator.FORMAT) !== '00:00' || endDate.toFormat(TimeValidator.FORMAT) !== '00:00') {
          isLessThan = startDate.diff(endDate) >= 0;
        }
        return (isLessThan)
            ? ({ lessThan: { value: isLessThan }})
            : null;
      }
    };
  }

  static RangePeriodValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors|null => {
      if (control.value) {
        let isRangeLessThan = false;
        const times = control.get('times') as UntypedFormArray;
        if (control.get('is_open').value && times.value.length > 1) {
          const firstStartDate = DateTime.fromFormat(times.at(0).get('start_time').value, TimeValidator.FORMAT);
          const firstEndDate = DateTime.fromFormat(times.at(0).get('end_time').value, TimeValidator.FORMAT);
          const lastStartDate = DateTime.fromFormat(times.at(1).get('start_time').value, TimeValidator.FORMAT);
          const lastEndDate = DateTime.fromFormat(times.at(1).get('end_time').value, TimeValidator.FORMAT);
          if (firstStartDate > lastStartDate) {
            isRangeLessThan = firstStartDate.diff(lastStartDate) <= 0
              || firstStartDate.diff(lastEndDate) <= 0;
          } else {
            isRangeLessThan = lastStartDate.diff(firstEndDate) <= 0
              || lastStartDate.diff(firstEndDate) <= 0;
          }
        }
        return (isRangeLessThan)
            ? ({ rangeLessThan: { value: isRangeLessThan }})
            : null;
      }
    };
  }
}
