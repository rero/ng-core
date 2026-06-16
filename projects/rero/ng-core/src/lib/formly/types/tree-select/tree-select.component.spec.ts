// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { FormFieldWrapperComponent } from '../../wrappers/form-field-wrapper/form-field-wrapper.component';
import { ITreeSelectProps, TreeSelectComponent } from './tree-select.component';

const renderComponent = (field: FormlyFieldConfig<ITreeSelectProps>) => {
  return createFieldComponent(field, {
    imports: [
      TreeSelectComponent,
      NoopAnimationsModule,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        types: [{ name: 'tree-select', component: TreeSelectComponent }],
        wrappers: [{ name: 'form-field', component: FormFieldWrapperComponent }],
      }),
    ],
  });
};

describe('TreeSelectComponent', () => {
  it('should create', () => {
    const { queryAll } = renderComponent({
      key: 'name',
      type: 'tree-select',
      props: {
        filterBy: 'label',
        filterInputAutoFocus: false,
        fluid: true,
        options: of([
          {
            key: 'label_1',
            label: 'Tree 1',
            untranslatedLabel: 'Tree 1',
            children: [
              { key: 'label_1_1', label: 'Subtree 1', data: 'subtree1', untranslatedLabel: 'Subtree 1' },
              { key: 'label_1_2', label: 'Subtree 2', data: 'subtree2', untranslatedLabel: 'Subtree 2' },
            ],
          },
        ]),
        scrollHeight: '400px',
        variant: 'outlined',
      } as any,
    });
    expect(queryAll('p-treeSelect')).toHaveLength(1);
  });
});
