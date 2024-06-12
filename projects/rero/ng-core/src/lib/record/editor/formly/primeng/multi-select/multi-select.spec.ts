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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { FormFieldWrapperComponent } from '../../../wrappers/form-field-wrapper/form-field-wrapper.component';
import { IMultiSelectProps, NgCoreFormlyMultiSelectModule } from './multi-select';

const renderComponent = (field: FormlyFieldConfig<IMultiSelectProps>) => {
  return createFieldComponent(field, {
    imports: [
      NgCoreFormlyMultiSelectModule,
      FormlyModule.forRoot({
        wrappers: [
          { name: 'form-field', component: FormFieldWrapperComponent }
        ]
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
        class: 'w-full',
        display: 'comma',
        editable: false,
        filter: true,
        filterMatchMode: 'contains',
        group: false,
        options: [],
        optionGroupChildren: 'items',
        optionGroupLabel: 'label',
        panelStyleClass: 'w-full',
        required: false,
        scrollHeight: '250px',
        showClear: false,
        styleClass: 'w-full mb-1',
        tooltipPosition: 'top',
        tooltipPositionStyle: 'absolute',
        variant: 'outlined'
      }
    });
    expect(queryAll('p-multiSelect')).not.toBeNull();
  });
});
