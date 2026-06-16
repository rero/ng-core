// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { FormFieldWrapperComponent } from '../../wrappers/form-field-wrapper/form-field-wrapper.component';
import { ISelectProps, SelectComponent } from './select.component';

const renderComponent = (field: FormlyFieldConfig<ISelectProps>) => {
  return createFieldComponent(field, {
    imports: [
      SelectComponent,
      NoopAnimationsModule,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        types: [{ name: 'select', component: SelectComponent }],
        wrappers: [{ name: 'form-field', component: FormFieldWrapperComponent }],
      }),
    ],
  });
};

describe('SelectComponent', () => {
  it('should create', () => {
    const { queryAll } = renderComponent({
      key: 'name',
      type: 'select',
      props: {
        editable: false,
        filterMatchMode: 'contains',
        fluid: true,
        group: false,
        options: of([
          { label: 'Foo', value: 'foo', untranslatedLabel: 'foo' },
          { label: 'Bar', value: 'bar', untranslatedLabel: 'bar' },
        ]),
        required: false,
        scrollHeight: '250px',
        sort: false,
        tooltipPosition: 'top',
        tooltipPositionStyle: 'absolute',
      } as any,
    });
    expect(queryAll('p-select')).toHaveLength(1);
  });
});
