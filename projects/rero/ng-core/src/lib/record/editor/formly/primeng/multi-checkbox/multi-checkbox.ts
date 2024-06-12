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
import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';

export interface IMultiCheckBoxProps extends FormlyFieldProps {
  labelStyleClass?: string;
  style: 'stacked' | 'inline';
  styleClass?: string;
}

@Component({
  selector: 'ng-core-multi-checkbox',
  template: `
    <div class="flex" [ngClass]="{ 'gap-3': props.style === 'inline', 'flex-column gap-1': props.style === 'stacked' }">
    @for (option of props.options | formlySelectOptions : field | async; track option) {
      <div class="flex align-items-center">
        <p-checkbox
          [disabled]="option.disabled"
          [formlyAttributes]="field"
          [label]="option.label"
          [labelStyleClass]="props.labelStyleClass"
          [name]="field.key"
          [ngModel]="field.formControl.value"
          [readonly]="props.readonly"
          [styleClass]="props.styleClass"
          [value]="option.value"
          (onChange)="onChange($event)"
        />
      </div>
    }
    </div>
  `,
})
export class MultiCheckboxComponent extends FieldType<FormlyFieldConfig<IMultiCheckBoxProps>> {
  /** Default options */
  defaultOptions?: Partial<FormlyFieldConfig<IMultiCheckBoxProps>> = {
    props: {
      style: 'stacked'
    }
  };

  multiCheckBoxValue: string[] = [];

  onChange(event: CheckboxChangeEvent): void {
    this.field.formControl.patchValue(event.checked);
  }
}

@NgModule({
  declarations: [ MultiCheckboxComponent ],
  imports: [
    CommonModule,
    CheckboxModule,
    FormsModule,
    FormlySelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'multi-checkbox',
          component: MultiCheckboxComponent,
          wrappers: ['form-field'],
        }
      ],
    }),
  ],
})
export class NgCoreFormlyMultiCheckboxModule { }
