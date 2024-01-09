/*
 * RERO angular core
 * Copyright (C) 2022-2024 RERO
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

import { Component, OnInit } from "@angular/core";
import { FieldType, FormlyFieldConfig } from "@ngx-formly/core";
import { FormlyFieldProps } from "@ngx-formly/primeng/form-field";

// Calendar options: https://www.primefaces.org/primeng/calendar
interface DateTimePickerProps extends FormlyFieldProps {
  styleClass?: string;
  inputStyleClass?: string;
  readonlyInput: boolean;
  inline: boolean;
  defaultDate?: Date;
  dateFormat: string;
  hourFormat: string;
  showTime?: boolean;
  showSeconds: boolean;
  stepHour: number;
  stepMinute: number;
  stepSecond: number;
  firstDayOfWeek?: number;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[];
}

@Component({
  selector: 'ng-core-editor-timepicker-type',
  template: `
    <div>
      <p-calendar
        [formControl]="formControl"
        [formlyAttributes]="field"
        [required]="props.required"
        [inputStyleClass]="props.inputStyleClass"
        [styleClass]="props.styleClass"
        [placeholder]="props.placeholder"
        [readonlyInput]="props.readonlyInput"
        [inline]="props.inline"
        [defaultDate]="props.defaultDate"
        [dateFormat]="props.dateFormat"
        [hourFormat]="props.hourFormat"
        [showTime]="props.showTime"
        [showSeconds]="props.showSeconds"
        [stepHour]="props.stepHour"
        [stepMinute]="props.stepMinute"
        [stepSecond]="props.stepSecond"
        [firstDayOfWeek]="props.firstDayOfWeek"
        [minDate]="props.minDate"
        [maxDate]="props.maxDate"
        [disabledDates]="props.disabledDates"
        [disabledDays]="props.disabledDays"
      ></p-calendar>
    </div>
  `
})
export class DateTimepickerTypeComponent extends FieldType<FormlyFieldConfig<DateTimePickerProps>> implements OnInit {
  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<DateTimePickerProps>> = {
    props: {
      required: false,
      inputStyleClass: 'form-control',
      disabled: false,
      inline: false,
      readonlyInput: false,
      dateFormat: 'yy-mm-dd',
      showSeconds: false,
      showTime: true,
      hourFormat: '24',
      stepHour: 1,
      stepMinute: 1,
      stepSecond: 1,
      firstDayOfWeek: 0
    },
  };

  /** OnInit hook */
  ngOnInit(): void {
    // Preferably use the readOnly parameter
    if (this.props.disabled) {
      this.formControl.disable();
    }
  }
}
