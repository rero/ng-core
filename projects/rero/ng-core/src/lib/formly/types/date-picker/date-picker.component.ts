// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, model, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { _, TranslatePipe } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { DatePicker } from 'primeng/datepicker';
import { Subscription } from 'rxjs';

// Calendar options: https://primeng.org/calendar
export interface IDateTimePickerProps extends FormlyFieldProps {
  appendTo?: string;
  clearButtonStyleClass?: string;
  dateFormat?: string;
  defaultDate?: Date | null;
  disabledDates: Date[];
  disabledDays: number[];
  firstDayOfWeek: number;
  fluid?: boolean;
  hourFormat: string;
  inline?: boolean;
  inputStyleClass?: string;
  maxDate?: Date | null;
  minDate?: Date | null;
  numberOfMonths: number;
  panelStyleClass?: string;
  placeholder?: string;
  readonlyInput?: boolean;
  required: boolean;
  showButtonBar?: boolean;
  showIcon?: boolean;
  showOnFocus?: boolean;
  stepHour?: number;
  stepMinute?: number;
  stepSecond?: number;
  styleClass?: string;
  todayButtonStyleClass?: string;
  view: 'date' | 'month' | 'year';
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
      [defaultDate]="defaultDate"
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
      [showClear]="!props.required"
      [showIcon]="props.showIcon"
      [showOnFocus]="props.showOnFocus"
      [stepHour]="props.stepHour"
      [stepMinute]="props.stepMinute"
      [stepSecond]="props.stepSecond"
      [class]="props.styleClass || ''"
      [todayButtonStyleClass]="props.todayButtonStyleClass"
      [view]="props.view"
      [ngClass]="{ 'ng-invalid ng-dirty': showError }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePicker, FormlyModule, FormsModule, NgClass, TranslatePipe],
})
export class DatePickerComponent extends FieldType<FieldTypeConfig<IDateTimePickerProps>> implements OnInit, OnDestroy {
  protected locale = inject(LOCALE_ID);

  value = model<Date | null>();

  private subscription: Subscription = new Subscription();

  defaultOptions: Partial<FieldTypeConfig<IDateTimePickerProps>> = {
    props: {
      appendTo: 'body',
      clearButtonStyleClass: 'p-button-text',
      dateFormat: 'yy-mm-dd',
      disabled: false,
      disabledDays: [],
      disabledDates: [],
      firstDayOfWeek: 0,
      fluid: true,
      hourFormat: '24',
      inline: false,
      numberOfMonths: 1,
      panelStyleClass: 'core:[p-motion:has(&)]:!min-w-0',
      placeholder: _('Select…'),
      required: false,
      showButtonBar: false,
      showIcon: true,
      showOnFocus: true,
      stepHour: 1,
      stepMinute: 1,
      stepSecond: 1,
      todayButtonStyleClass: 'p-button-text',
      view: 'date',
    },
  };

  defaultDate: Date | null = null;
  disabledDates: Date[] = [];
  maxDate: Date | null = null;
  minDate: Date | null = null;

  ngOnInit(): void {
    this.subscription.add(
      this.formControl.valueChanges.subscribe((value) => {
        const date = value ? new Date(value) : null;
        if (this.value() !== date) {
          this.value.set(date);
        }
      }),
    );

    const { value } = this.formControl;
    if (value) {
      this.value.set(new Date(value));
    }

    if (!this.formControl.value && this.props.defaultDate != null) {
      this.defaultDate = this.processDate(this.props.defaultDate);
    }

    if (this.props.disabledDates != null) {
      this.disabledDates = this.props.disabledDates.map((date) => this.processDate(date));
    }

    if (this.props.minDate) {
      this.minDate = this.processDate(this.props.minDate);
    }

    if (this.props.maxDate) {
      this.maxDate = this.processDate(this.props.maxDate);
    }

    this.subscription.add(
      this.value.subscribe((value) => {
        if (value) {
          const convertedDate = this.outputDate(value);
          if (convertedDate !== this.formControl.value) {
            this.formControl.patchValue(convertedDate);
            this.formControl.markAsTouched();
          }
        } else {
          this.clearFormValue();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  clearFormValue(): void {
    this.formControl.reset(null);
    const { errors } = this.formControl;
    this.formControl.setErrors(errors?.required ? { required: true } : null);
  }

  private processDate(date: string | Date): Date {
    if (date instanceof Date) {
      return date;
    }
    if (typeof date === 'string') {
      return new Date(date);
    }
    throw new Error('Invalid date value');
  }

  private outputDate(value: string | Date): string {
    return DateTime.fromJSDate(this.processDate(value)).toFormat('yyyy-MM-dd');
  }
}
