// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { of } from 'rxjs';
import { IMultiSelectProps, MultiSelectComponent } from './multi-select.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormFieldWrapperComponent } from '../../wrappers/form-field-wrapper/form-field-wrapper.component';

const renderComponent = (field: FormlyFieldConfig<IMultiSelectProps>) => {
  return createFieldComponent(field, {
    imports: [
      MultiSelectComponent,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        types: [{ name: 'multi-select', component: MultiSelectComponent }],
        wrappers: [{ name: 'form-field', component: FormFieldWrapperComponent }],
      }),
      NoopAnimationsModule,
    ],
  });
};

describe('MultiSelectComponent', () => {
  it('should create', () => {
    const { queryAll } = renderComponent({
      key: 'name',
      type: 'multi-select',
      props: {
        display: 'comma',
        editable: false,
        fluid: true,
        filterMatchMode: 'contains',
        group: false,
        options: of([]),
        required: false,
        scrollHeight: '250px',
        sort: false,
        tooltipPosition: 'top',
        tooltipPositionStyle: 'absolute',
        variant: 'outlined',
      } as any,
    });
    expect(queryAll('p-multiSelect')).not.toBeNull();
  });
});
