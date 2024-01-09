/*
 * RERO angular core
 * Copyright (C) 2022-2024 RERO
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
import { Component } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface MultiCheckboxProps extends FormlyFieldProps {
  style: 'stacked' | 'inline';
}

@Component({
  selector: 'ng-core-editor-formly-field-multicheckbox',
  template: `
    <div>
      @for (option of props.options | formlySelectOptions : field | async; track option; let i = $index;) {
        <div [ngClass]="{'form-check': props.style === 'stacked', 'form-check-inline': props.style === 'inline'}">
          <input
            type="checkbox"
            class="form-check-input"
            [id]="id + '_' + i"
            [value]="option.value"
            [checked]="isChecked(option)"
            [disabled]="formControl.disabled || option.disabled"
            (change)="onChange(option.value, $event.target.checked)"
          >
          <label class="form-check-label" [for]="id + '_' + i">{{ option.label }}</label>
          @if (showError && formControl.errors) {
            <div class="invalid-feedback d-block mt-1" role="alert">
              <formly-validation-message [field]="field"></formly-validation-message>
            </div>
          }
      </div>
      }
  `,
})
export class MultiCheckboxComponent extends FieldType<FormlyFieldConfig<MultiCheckboxProps>> {
  /** Default options */
  defaultOptions?: Partial<FormlyFieldConfig<MultiCheckboxProps>> = {
    props: {
      style: 'stacked'
    }
  };

  /**
   * Adds or removes the value of a checkbox in the list of values.
   * @param value - checkbox value
   * @param checked - True if checked
   */
  onChange(value: any, checked: boolean): void {
    this.formControl.markAsDirty();
    if (Array.isArray(this.formControl.value)) {
      this.formControl.patchValue(
        checked
          ? [...(this.formControl.value || []), value]
          : [...(this.formControl.value || [])].filter((o) => o !== value),
      );
    } else {
      this.formControl.patchValue({ ...this.formControl.value, [value]: checked });
    }
    this.formControl.markAsTouched();
  }

  /**
   * Activates the checkbox if the value exists in the list.
   * @param option - current checkbox
   * @return True if the current checkbox value exists in the list of values
   */
  isChecked(option: any): boolean {
    const { value } = this.formControl;

    return value && (Array.isArray(value) ? value.indexOf(option.value) !== -1 : value[option.value]);
  }
}
