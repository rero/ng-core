/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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
import { ConfigOption } from '@ngx-formly/core';
import { withFormlyPrimeNG } from '@ngx-formly/primeng';
import { DatePickerComponent } from '../types/date-picker/date-picker.component';
import { InputComponent } from '../types/input/input.component';
import { MarkdownFieldComponent } from '../types/markdown/markdown.component';
import { MultiCheckboxComponent } from '../types/multi-checkbox/multi-checkbox.component';
import { MultiSelectComponent } from '../types/multi-select/multi-select.component';
import { MultiSchemaComponent } from '../types/multischema/multischema.component';
import { ObjectComponent } from '../types/object/object.component';
import { PasswordGeneratorComponent } from '../types/password-generator/password-generator.component';
import { RadioButtonComponent } from '../types/radio-button/radio-button.component';
import { RemoteAutocompleteComponent } from '../types/remote-autocomplete/remote-autocomplete.component';
import { SelectComponent } from '../types/select/select.component';
import { SwitchComponent } from '../types/switch/switch.component';
import { TextareaFieldComponent } from '../types/textarea/textarea.component';
import { TreeSelectComponent } from '../types/tree-select/tree-select.component';
import { emailValidator } from '../validator/email.validator';
import { CardWrapperComponent } from '../wrappers/card-wrapper/card-wrapper.component';
import { FormFieldWrapperComponent } from '../wrappers/form-field-wrapper/form-field-wrapper.component';
import { HideWrapperComponent } from '../wrappers/hide-wrapper/hide-wrapper.component';
import { ArrayComponent } from '../types/array/array.component';

/**
 * Default Formly configuration for ng-core
 * Can be used with provideFormlyCore(withNgCoreFormly())
 */
export function withNgCoreFormly(): ConfigOption[] {
  return [
    ...withFormlyPrimeNG(),
    {
      extensions: [{ name: 'email', extension: { prePopulate: emailValidator } }],
      extras: {
        checkExpressionOn: 'changeDetectionCheck',
        resetFieldOnHide: true,
      },
      types: [
        {
          name: 'datePicker',
          component: DatePickerComponent,
          wrappers: ['form-field'],
        },
        {
          name: 'dateTimePicker', // For compatibility TODO: remove in future
          extends: 'datePicker',
        },
        {
          name: 'multi-select',
          component: MultiSelectComponent,
          wrappers: ['form-field'],
        },
        {
          name: 'tree-select',
          component: TreeSelectComponent,
          wrappers: ['form-field'],
        },
        {
          name: 'multi-checkbox',
          component: MultiCheckboxComponent,
          wrappers: ['form-field'],
        },
        {
          name: 'input',
          component: InputComponent,
          wrappers: ['form-field'],
        },
        { name: 'string', extends: 'input' },
        {
          name: 'select',
          component: SelectComponent,
          wrappers: ['form-field'],
        },
        { name: 'enum', extends: 'select' },
        {
          name: 'number',
          extends: 'input',
          defaultOptions: {
            props: {
              type: 'number',
            },
          },
        },
        {
          name: 'remoteAutoComplete',
          component: RemoteAutocompleteComponent,
        },
        {
          name: 'integer',
          extends: 'input',
          defaultOptions: {
            props: {
              type: 'number',
            },
          },
        },
        { name: 'boolean', component: SwitchComponent
         },
        { name: 'enum', extends: 'select' },
        { name: 'array', component: ArrayComponent, wrappers: ['card'] },
        { name: 'object', component: ObjectComponent, wrappers: ['card'] },
        { name: 'multischema', component: MultiSchemaComponent },
        { name: 'textarea', component: TextareaFieldComponent },
        { name: 'markdown', component: MarkdownFieldComponent },
        { name: 'passwordGenerator', component: PasswordGeneratorComponent
         },
        { name: 'radioButton', component: RadioButtonComponent },
      ],
      wrappers: [
        { name: 'form-field', component: FormFieldWrapperComponent },
        { name: 'hide', component: HideWrapperComponent },
        { name: 'card', component: CardWrapperComponent },
      ],
    },
  ];
}
