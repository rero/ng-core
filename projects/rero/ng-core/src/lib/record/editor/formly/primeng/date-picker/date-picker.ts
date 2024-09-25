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
import { CommonModule } from '@angular/common';
import { Component, inject, LOCALE_ID, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { CalendarModule } from 'primeng/calendar';

// Calendar options: https://primeng.org/calendar
export interface IDateTimePickerProps extends FormlyFieldProps {
  clearButtonStyleClass: string;
  dataType: 'date' | 'string';
  dateFormat?: string;
  defaultDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[];
  firstDayOfWeek?: number;
  hourFormat?: string;
  inline: boolean;
  inputStyleClass?: string;
  outputDateFormat: string;
  maxDate?: Date;
  minDate?: Date;
  numberOfMonths: number;
  readonlyInput?: boolean;
  selectionMode: 'multiple' | 'range' | 'single';
  showButtonBar: boolean;
  showIcon: boolean;
  showSeconds: boolean;
  showTime?: boolean;
  stepHour: number;
  stepMinute: number;
  stepSecond: number;
  styleClass: string;
  todayButtonStyleClass: string;
  view?: 'date' | 'month' | 'year';
}

@Component({
  selector: 'ng-core-date-picker',
  template: `
    <p-calendar
      [(ngModel)]="model"
      [clearButtonStyleClass]="props.clearButtonStyleClass"
      [dataType]="props.dataType"
      [dateFormat]="props.dateFormat"
      [defaultDate]="props.defaultDate"
      [disabled]="props.disabled"
      [disabledDates]="disabledDates"
      [disabledDays]="props.disabledDays"
      [firstDayOfWeek]="props.firstDayOfWeek"
      [formlyAttributes]="field"
      [hourFormat]="props.hourFormat"
      [inline]="props.inline"
      [inputStyleClass]="props.inputStyleClass"
      [maxDate]="maxDate"
      [minDate]="minDate"
      [numberOfMonths]="props.numberOfMonths"
      [placeholder]="props.placeholder"
      [readonlyInput]="props.readonlyInput || props.selectionMode !== 'single'"
      [required]="props.required"
      [selectionMode]="props.selectionMode"
      [showButtonBar]="props.showButtonBar"
      [showIcon]="props.showIcon"
      [showSeconds]="props.showSeconds"
      [showTime]="props.showTime"
      [stepHour]="props.stepHour"
      [stepMinute]="props.stepMinute"
      [stepSecond]="props.stepSecond"
      [styleClass]="props.styleClass"
      [todayButtonStyleClass]="props.todayButtonStyleClass"
      [view]="props.view"
    />
  `,
})
export class DatePickerComponent extends FieldType<FormlyFieldConfig<IDateTimePickerProps>> implements OnInit {

  private locale = inject(LOCALE_ID);

  defaultOptions: Partial<FormlyFieldConfig<IDateTimePickerProps>> = {
    props: {
      clearButtonStyleClass: 'p-button-text',
      dataType: 'string',
      dateFormat: 'yy-mm-dd',
      disabled: false,
      firstDayOfWeek: 0,
      inline: false,
      numberOfMonths: 1,
      outputDateFormat: 'yyyy-MM-dd',
      required: false,
      selectionMode: 'single',
      showButtonBar: false,
      showIcon: false,
      showSeconds: false,
      showTime: false,
      stepHour: 1,
      stepMinute: 1,
      stepSecond: 1,
      styleClass: 'w-full',
      todayButtonStyleClass: 'p-button-text',
      view: 'date'
    },
  };

  private fieldModel: Date | Date[];

  set model(value: Date | Date[]) {
    this.formControl.patchValue(value);
  }

  get model(): Date | Date[] {
    return this.fieldModel;
  }

  defaultDate: Date = undefined;
  disabledDates: Date[] = undefined;
  maxDate: Date = undefined;
  minDate: Date = undefined;

  ngOnInit(): void {
    if (this.formControl.value) {
      this.fieldModel = this.formControl.value;
    }
    if (!this.formControl.value && this.props.defaultDate) {
      this.defaultDate = this.processDate(this.props.defaultDate);
    }
    if (this.props.disabledDates) {
      this.disabledDates = this.props.disabledDates.map((date: any) =>this.processDate(date));
    }
    if (this.props.minDate) {
      this.minDate = this.processDate(this.props.minDate);
    }
    if (this.props.maxDate) {
      this.maxDate = this.processDate(this.props.maxDate);
    }
  }

  private processDate(date: string | Date ): Date {
    return date instanceof Date ? date : new Date(date);
  }
}


@NgModule({
  declarations: [DatePickerComponent],
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'datePicker',
          component: DatePickerComponent,
          wrappers: ['form-field'],
        },
        {
          name: 'dateTimePicker', // For compatibility
          extends: 'datePicker'
        }
      ],
    }),
  ],
  exports: [DatePickerComponent]
})
export class NgCoreFormlyDatePickerModule { }
