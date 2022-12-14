/*
 * RERO angular core
 * Copyright (C) 2022 RERO
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

import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/core";

@Component({
  selector: 'ng-core-editor-timepicker-type',
  template: `
    <div>
      <p-calendar
        [formControl]="formControl"
        [formlyAttributes]="field"
        [required]="to.required"
        [inputStyleClass]="to.inputStyleClass"
        [styleClass]="to.styleClass"
        [placeholder]="to.placeholder"
        [disabled]="to.disabled"
        [readonlyInput]="to.readonlyInput"
        [inline]="to.inline"
        [defaultDate]="to.defaultDate"
        [dateFormat]="to.dateFormat"
        [hourFormat]="to.hourFormat"
        [showTime]="to.withTime"
        [showSeconds]="to.showSeconds"
        [stepHour]="to.stepHour"
        [stepMinute]="to.stepMinute"
        [stepSecond]="to.stepSecond"
        [firstDayOfWeek]="to.firstDayOfWeek"
        [minDate]="to.minDate"
        [maxDate]="to.maxDate"
        [disabledDates]="to.disabledDates"
        [disabledDays]="to.disabledDays"
      ></p-calendar>
    </div>
  `
})
export class DateTimepickerTypeComponent extends FieldType {

  // Calendar options: https://www.primefaces.org/primeng/calendar
  defaultOptions = {
    templateOptions: {
      required: false,
      styleClass: null,
      inputStyleClass: 'form-control',
      placeholder: null,
      disabled: false,
      inline: false,
      readonlyInput: false,
      defaultDate: null,
      dateFormat: 'yy-mm-dd',
      showSeconds: false,
      withTime: true,
      hourFormat: 24,                     // Specifies 12 or 24 hour format
      stepHour: 1,
      stepMinute: 1,
      stepSecond: 1,
      firstDayOfWeek: 0,
      minDate: null,                      // Date
      maxDate: null,                      // Date
      disabledDates: null,                // Array<Date>
      disabledDays: null                  // Array<number>
    },
  };
}
