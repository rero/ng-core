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
import { FormFieldWrapperComponent } from '../../../wrappers/form-field-wrapper/form-field-wrapper.component';
import { ITreeSelectProps, NgCoreFormlyTreeSelectModule } from './tree-select';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

const renderComponent = (field: FormlyFieldConfig<ITreeSelectProps>) => {
  return createFieldComponent(field, {
    imports: [
      NgCoreFormlyTreeSelectModule,
      NoopAnimationsModule,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        wrappers: [
          { name: 'form-field', component: FormFieldWrapperComponent }
        ]
      })
    ],
  });
};

describe('TreeSelectComponent', () => {
  it('should create', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'tree-select',
      props: {
        class: 'w-full',
        containerStyleClass: 'w-full',
        filter: false,
        filterBy: 'label',
        options: of([
          {
            key: 'label_1',
            label: 'Tree 1',
            untranslatedLabel: 'Tree 1',
            children: [
              { key: 'label_1_1', label: 'Subtree 1', data: 'subtree1', untranslatedLabel: 'Subtree 1' },
              { key: 'label_1_2', label: 'Subtree 2', data: 'subtree2', untranslatedLabel: 'Subtree 2' }
            ]
          }
        ]),
        panelClass: 'w-full',
        panelStyleClass: 'w-full',
        scrollHeight: '400px',
        variant: 'outlined'
      }
    });
    expect(query('p-treeSelect')).toHaveSize(1);
  });
});
