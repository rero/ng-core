/*
 * RERO angular core
 * Copyright (C) 2024 RERO
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
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { DateTime } from "luxon";

export class Validators {
  static dateGreaterThan(dateFirstName: string, dateLastName: string, strictMode: boolean = false): ValidatorFn {
    return dateGreaterThanValidator(dateFirstName, dateLastName, strictMode);
  }
}

export function dateGreaterThanValidator(dateFirstName: string, dateLastName: string, strict: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dateFormat = 'yyyy-MM-dd';
    const dateFirst = control.parent.get(dateFirstName);
    const dateLast = control.parent.get(dateLastName);
    if (dateFirst.value !== null && dateLast.value !== null) {
      const dateTimeFirst = DateTime.fromFormat(dateFirst.value, dateFormat);
      const dateTimeLast = DateTime.fromFormat(dateLast.value, dateFormat);
      const status = strict ? dateTimeFirst >= dateTimeLast : dateTimeFirst > dateTimeLast;

      if (status) {
        dateLast.setErrors(null);
        dateLast.markAsDirty();
      }

      return status ? { dateGreaterThan: { value: true }} : null;
    }

    return null;
  }
}
