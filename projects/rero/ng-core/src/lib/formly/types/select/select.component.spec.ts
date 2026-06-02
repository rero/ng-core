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
