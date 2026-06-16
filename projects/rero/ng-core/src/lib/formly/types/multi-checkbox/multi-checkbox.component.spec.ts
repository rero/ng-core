// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { of } from 'rxjs';
import { IMultiCheckBoxProps, MultiCheckboxComponent } from './multi-checkbox.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormFieldWrapperComponent } from '../../wrappers/form-field-wrapper/form-field-wrapper.component';

const renderComponent = (field: FormlyFieldConfig<IMultiCheckBoxProps>) => {
  return createFieldComponent(field, {
    imports: [
      MultiCheckboxComponent,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        types: [{ name: 'multi-checkbox', component: MultiCheckboxComponent }],
        wrappers: [{ name: 'form-field', component: FormFieldWrapperComponent }],
      }),
    ],
  });
};

describe('MultiCheckboxComponent', () => {
  it('should return stacked checkboxes', () => {
    const { queryAll } = renderComponent({
      key: 'name',
      type: 'multi-checkbox',
      props: {
        style: 'stacked',
        options: of([
          { label: 'foo', value: 'foo', untranslatedLabel: 'foo' },
          { label: 'bar', value: 'bar', untranslatedLabel: 'bar' },
        ]),
      },
    });
    expect(queryAll('p-checkbox')).toHaveLength(2);
    expect(queryAll('div[class="core:flex core:flex-col core:gap-1"')).toHaveLength(1);
  });

  it('should return checkboxes in line', () => {
    const { queryAll } = renderComponent({
      key: 'name',
      type: 'multi-checkbox',
      props: {
        style: 'inline',
        options: of([
          { label: 'foo', value: 'foo', untranslatedLabel: 'foo' },
          { label: 'bar', value: 'bar', untranslatedLabel: 'bar' },
        ]),
      },
    });
    expect(queryAll('p-checkbox')).toHaveLength(2);
    expect(queryAll('div[class="core:flex core:gap-3"]')).toHaveLength(1);
  });
});
