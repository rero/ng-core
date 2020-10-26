/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { Component, OnInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { isEmpty, removeEmptyValues } from '../../utils';

@Component({
  selector: 'ng-core-editor-formly-toggle-wrapper',
  template: `
    <div class='toggle-wrapper'>
      <div class='form-group'>
        <div class="custom-control custom-switch">
          <input class="custom-control-input" type="checkbox" id="toggle-switch-{{ field.id }}" \
                 (change)="toggle($event)" [checked]="tsOptions.enabled">
          <label class="custom-control-label" for="toggle-switch-{{ field.id }}" \
                 [tooltip]="tsOptions.description">{{ tsOptions.label }}</label>
        </div>
      </div>
      <ng-container *ngIf="tsOptions.enabled" #fieldComponent></ng-container>
    </div>
  `
})
export class ToggleWrapperComponent extends FieldWrapper implements OnInit {

  tsOptions = {
    label: 'Toggle',
    description: null,
    enabled: false
  };

  ngOnInit() {
    if (this.to['toggle-switch']) {
      this.tsOptions = {...this.tsOptions, ...this.to['toggle-switch']};
    }
    /* For simple field the code below works fine to enable the toggle switch if needed */
    this.tsOptions.enabled = !isEmpty(removeEmptyValues(this.formControl.value));
    if (!this.tsOptions.enabled) {
      this.field.formControl.disable({emitEvent: false});
    }
    /* For complex object (array or object), it's more complex:
     *   When wrapper is initialize, we should enable the toggle if the model already contains some data.
     *   But, on init, the model isn't yet populated with data ; so we can't just check the model.
     *   The least worst solution is to subscribe to `valueChanges` observable and check the model when we receive a response
     *   Note: for a 'CustomField', it's better to implement `FormlyExtension` and use the `onPopulate` method
     */
    this.formControl.valueChanges.subscribe(
      (newValue) => {
        this.tsOptions.enabled = !isEmpty(removeEmptyValues(newValue));
        if (this.tsOptions.enabled) {
          this.field.formControl.enable({emitEvent: false});
        } else {
          this.field.formControl.disable({emitEvent: false});
        }
      }
    );
  }

  toggle(event: any) {
    if (this.tsOptions.enabled === true) {
      // toggle switch will became 'false', so just reset the field.
      //   Resetting the field will change its value and so the `valueChanges` Observer will be called. The toggle `enabled` value will
      //   be update (to false) by this method.
      this.field.formControl.reset();  // reset all children fields
    } else {
      this.tsOptions.enabled = true;
      this.field.formControl.enable({emitEvent: false});
    }
  }
}
