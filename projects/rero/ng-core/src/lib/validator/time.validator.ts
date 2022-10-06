/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import moment from 'moment';

// @dynamic
export class TimeValidator {

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
        const startDate = moment(startTime.value, 'HH:mm');
        const endDate = moment(endTime.value, 'HH:mm');
        if (startDate.format('HH:mm') !== '00:00' || endDate.format('HH:mm') !== '00:00') {
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
          const firstStartDate = moment(times.at(0).get('start_time').value, 'HH:mm');
          const firstEndDate = moment(times.at(0).get('end_time').value, 'HH:mm');
          const lastStartDate = moment(times.at(1).get('start_time').value, 'HH:mm');
          const lastEndDate = moment(times.at(1).get('end_time').value, 'HH:mm');
          if (firstStartDate > lastStartDate) {
            isRangeLessThan = firstStartDate.diff(lastStartDate) <= 0
              || firstStartDate.diff(lastEndDate) <= 0;
          } else {
            isRangeLessThan = lastStartDate.diff(firstEndDate) <= 0
              || lastStartDate.diff(firstEndDate) <= 0;
          }
        }
        return (isRangeLessThan)
            ? ({ rangeLessThan: { value: isRangeLessThan}})
            : null;
      }
    };
  }
}
