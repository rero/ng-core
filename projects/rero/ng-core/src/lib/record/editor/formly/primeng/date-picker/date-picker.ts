/*
 * RERO angular core
 * Copyright (C) 2024-2025 RERO
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
import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, model, NgModule, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { _, TranslateModule } from '@ngx-translate/core';
import { DateTime } from "luxon";
import { DatePickerModule } from 'primeng/datepicker';
import { Subscription } from 'rxjs';

// Calendar options: https://primeng.org/calendar
export interface IDateTimePickerProps extends FormlyFieldProps {
  appendTo?: string;
  clearButtonStyleClass?: string;
  dateFormat?: string;
  defaultDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[];
  firstDayOfWeek?: number;
  fluid?: boolean;
  hourFormat?: string;
  inline?: boolean;
  inputStyleClass?: string;
  maxDate?: Date;
  minDate?: Date;
  numberOfMonths?: number;
  panelStyleClass?: string;
  placeholder?: string;
  readonlyInput?: boolean;
  showButtonBar?: boolean;
  showIcon?: boolean;
  showOnFocus?: boolean;
  stepHour?: number;
  stepMinute?: number;
  stepSecond?: number;
  styleClass?: string;
  todayButtonStyleClass?: string;
  view?: 'date' | 'month' | 'year';
}

@Component({
    selector: 'ng-core-date-picker',
    template: `
    <p-datepicker
      [(ngModel)]="value"
      [formlyAttributes]="field"
      [appendTo]="props.appendTo"
      [clearButtonStyleClass]="props.clearButtonStyleClass"
      [dateFormat]="props.dateFormat"
      [defaultDate]="props.defaultDate"
      [disabledDates]="disabledDates"
      [disabledDays]="props.disabledDays"
      [firstDayOfWeek]="props.firstDayOfWeek"
      [fluid]="props.fluid"
      [hourFormat]="props.hourFormat"
      [inline]="props.inline"
      [inputStyleClass]="props.inputStyleClass"
      [maxDate]="maxDate"
      [minDate]="minDate"
      [numberOfMonths]="props.numberOfMonths"
      [panelStyleClass]="props.panelStyleClass"
      [placeholder]="props.placeholder | translate"
      [readonlyInput]="props.readonlyInput"
      [required]="props.required"
      selectionMode="single"
      [showButtonBar]="props.showButtonBar"
      [showIcon]="props.showIcon"
      [showOnFocus]="props.showOnFocus"
      [stepHour]="props.stepHour"
      [stepMinute]="props.stepMinute"
      [stepSecond]="props.stepSecond"
      [styleClass]="props.styleClass"
      [todayButtonStyleClass]="props.todayButtonStyleClass"
      [view]="props.view"
      [ngClass]="{ 'ng-invalid ng-dirty': showError }"
    />
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DatePickerComponent extends FieldType<FormlyFieldConfig<IDateTimePickerProps>> implements OnInit, OnDestroy {

  protected locale = inject(LOCALE_ID);

  value = model<Date>();

  private subscription: Subscription = new Subscription();

  defaultOptions: Partial<FormlyFieldConfig<IDateTimePickerProps>> = {
    props: {
      appendTo: 'body',
      clearButtonStyleClass: 'p-button-text',
      dateFormat: 'yy-mm-dd',
      disabled: false,
      firstDayOfWeek: 0,
      fluid: true,
      inline: false,
      numberOfMonths: 1,
      panelStyleClass: 'core:!min-w-0',
      placeholder: _('Select…'),
      required: false,
      showButtonBar: false,
      showIcon: true,
      showOnFocus: true,
      stepHour: 1,
      stepMinute: 1,
      stepSecond: 1,
      todayButtonStyleClass: 'p-button-text',
      view: 'date'
    },
  };

  defaultDate?: Date = undefined;
  disabledDates?: Date[] = undefined;
  maxDate?: Date = undefined;
  minDate?: Date = undefined;

  ngOnInit(): void {
    this.subscription.add(this.formControl.valueChanges.subscribe((value) => {
      const date = new Date(value);
      if (this.value() !== date) {
        this.value.set(date)
      }
    }));

    const { value } = this.formControl;
    if (value) {
      this.value.set(new Date(value));
    }

    if (!this.formControl.value && this.props.defaultDate) {
      this.defaultDate = this.processDate(this.props.defaultDate);
    }
    if (this.props.disabledDates) {
      this.disabledDates = this.props.disabledDates.map((date: string | Date) =>this.processDate(date));
    }
    if (this.props.minDate) {
      this.minDate = this.processDate(this.props.minDate);
    }
    if (this.props.maxDate) {
      this.maxDate = this.processDate(this.props.maxDate);
    }

    this.subscription.add(this.value.subscribe((value: string | Date) => {
      if (value) {
        const convertedDate = this.outputDate(value);
        if (convertedDate !== this.formControl.value) {
          this.formControl.patchValue(convertedDate);
          this.formControl.markAsTouched();
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private processDate(date: string | Date ): Date {
    return date instanceof Date ? date : new Date(date);
  }

  private outputDate(value: string|Date): string {
    return DateTime
      .fromJSDate(this.processDate(value))
      .toFormat('yyyy-MM-dd');
  }
}


@NgModule({
  declarations: [DatePickerComponent],
  imports: [
    CommonModule,
    DatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
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
