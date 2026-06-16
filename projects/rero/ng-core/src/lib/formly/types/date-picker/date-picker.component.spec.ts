// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DatePickerComponent, IDateTimePickerProps } from './date-picker.component';
import { FormFieldWrapperComponent } from '../../wrappers/form-field-wrapper/form-field-wrapper.component';

const renderComponent = (field: FormlyFieldConfig<IDateTimePickerProps>) => {
  return createFieldComponent(field, {
    imports: [
      DatePickerComponent,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        types: [{ name: 'datePicker', component: DatePickerComponent }],
        wrappers: [{ name: 'form-field', component: FormFieldWrapperComponent }],
      }),
      NoopAnimationsModule,
    ],
  });
};

describe('DatePickerComponent', () => {
  it('should create', () => {
    const { query } = renderComponent({
      key: 'date',
      type: 'datePicker',
      props: {
        appendTo: 'body',
        clearButtonStyleClass: 'p-button-text',
        dateFormat: 'yy-mm-dd',
        disabled: false,
        firstDayOfWeek: 0,
        fluid: true,
        inline: false,
        numberOfMonths: 1,
        panelStyleClass: '',
        required: false,
        showButtonBar: false,
        showIcon: false,
        stepHour: 1,
        stepMinute: 1,
        stepSecond: 1,
        styleClass: '',
        todayButtonStyleClass: 'p-button-text',
        view: 'date',
      } as any,
    });

    const element = query('p-datepicker');
    expect(element).not.toBeNull();
  });

  it('should return the correct output format', () => {
    const { fixture, field } = renderComponent({
      key: 'date',
      type: 'datePicker',
      props: {
        appendTo: 'body',
        clearButtonStyleClass: 'p-button-text',
        dateFormat: 'dd.mm.yy',
        disabled: false,
        firstDayOfWeek: 0,
        fluid: true,
        inline: false,
        numberOfMonths: 1,
        panelStyleClass: '',
        required: false,
        showButtonBar: false,
        showIcon: false,
        stepHour: 1,
        stepMinute: 1,
        stepSecond: 1,
        styleClass: '',
        todayButtonStyleClass: 'p-button-text',
        view: 'date',
      } as any,
    });
    fixture.detectChanges();
    expect(field?.formControl?.value).toBeUndefined();

    const date = '1996-06-25';
    field.formControl?.setValue(new Date(date));
    fixture.detectChanges();
    expect(field?.formControl?.value).toEqual(date);
  });
});
