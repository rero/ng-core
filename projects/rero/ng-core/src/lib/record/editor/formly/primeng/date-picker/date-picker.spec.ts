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

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormFieldWrapperComponent } from '../../../wrappers/form-field-wrapper/form-field-wrapper.component';
import { IDateTimePickerProps, NgCoreFormlyDatePickerModule } from './date-picker';

const renderComponent = (field: FormlyFieldConfig<IDateTimePickerProps>) => {
  return createFieldComponent(field, {
    imports: [
      NgCoreFormlyDatePickerModule,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        wrappers: [
          { name: 'form-field', component: FormFieldWrapperComponent }
        ]
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
        view: 'date'
      }
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
        view: 'date'
      }
    });
    fixture.detectChanges();
    expect(field?.formControl?.value).toBeUndefined();

    const date = '1996-06-25';
    field.formControl?.setValue(new Date(date));
    fixture.detectChanges();
    expect(field?.formControl?.value).toEqual(date);
  });
});
