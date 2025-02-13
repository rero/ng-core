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
import { ISelectProps, NgCoreFormlySelectModule } from './select';

const renderComponent = (field: FormlyFieldConfig<ISelectProps>) => {
  return createFieldComponent(field, {
    imports: [
      NgCoreFormlySelectModule,
      NoopAnimationsModule,
      FormlyModule.forRoot({
        wrappers: [
          { name: 'form-field', component: FormFieldWrapperComponent }
        ]
      })
    ],
  });
};

describe('SelectComponent', () => {
  it('should create', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'select',
      props: {
        class: 'w-full',
        editable: false,
        filter: false,
        filterMatchMode: 'contains',
        group: false,
        options: [
          { label: 'Foo', value: 'foo' },
          { label: 'Bar', value: 'bar' },
        ],
        panelStyleClass: 'w-full',
        required: false,
        scrollHeight: '250px',
        sort: false,
        styleClass: 'w-full mb-1',
        tooltipPosition: 'top',
        tooltipPositionStyle: 'absolute'
      }
    });
    expect(query('p-dropdown')).toHaveSize(1);
  });
});
