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

import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { FormFieldWrapperComponent } from '../../../wrappers/form-field-wrapper/form-field-wrapper.component';
import { IMultiCheckBoxProps, NgCoreFormlyMultiCheckboxModule } from './multi-checkbox';

const renderComponent = (field: FormlyFieldConfig<IMultiCheckBoxProps>) => {
  return createFieldComponent(field, {
    imports: [
      NgCoreFormlyMultiCheckboxModule,
      FormlyModule.forRoot({
        wrappers: [
          { name: 'form-field', component: FormFieldWrapperComponent }
        ]
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
        options: [
          { label: 'foo', value: 'foo' },
          { label: 'bar', value: 'bar' },
        ],
      }
    });
    expect(queryAll('p-checkbox')).toHaveSize(2);
    expect(queryAll('div.flex.flex-column.gap-1')).toHaveSize(1);
  });

  it('should return checkboxes in line', () => {
    const { queryAll } = renderComponent({
      key: 'name',
      type: 'multi-checkbox',
      props: {
        style: 'inline',
        options: [
          { label: 'foo', value: 'foo' },
          { label: 'bar', value: 'bar' },
        ],
      }
    });
    expect(queryAll('p-checkbox')).toHaveSize(2);
    expect(queryAll('div.flex.gap-3')).toHaveSize(1);
  });
});
