/*
 * RERO angular core
 * Copyright (C) 2022 RERO
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

@Component({
  selector: 'ng-core-editor-formly-field-multicheckbox',
  template: `
    <div>
      <div
        *ngFor="let option of to.options | formlySelectOptions:field | async; let i = index;"
        [ngClass]="{
          'form-check': to.style === 'stacked',
          'form-check-inline': to.style === 'inline'
        }"
      >
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
      </div>
      <!--  validation error message -->
      <div class="invalid-feedback d-block mt-1" role="alert" *ngIf="showError && formControl.errors">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
})
export class MulticheckboxComponent extends FieldType {
  /** Default options */
  defaultOptions: Partial<FormlyFieldConfig> = {
    templateOptions: {
      options: [],
      style: 'stacked' // 'stacked' | 'inline'
    }
  };

  /**
   * Adds or removes the value of a checkbox in the list of values.
   * @param value - checkbox value
   * @param checked - True if checked
   */
  onChange(value: any, checked: boolean): void {
    this.formControl.markAsDirty();
    const formValue = (this.formControl.value || []);
    if (checked) {
      formValue.push(value);
    } else {
      formValue.splice(formValue.indexOf(value), 1);
    }
    this.formControl.patchValue(formValue);
    this.formControl.markAsTouched();
  }

  /**
   * Activates the checkbox if the value exists in the list.
   * @param option - current ckeckbox
   * @return True if the current checkbox value exists in the list of values
   */
  isChecked(option: any): boolean {
    const value = this.formControl.value;

    return value.includes(option.value);
  }
}
