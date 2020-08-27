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
import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

/**
 * Component for displaying a switcher in editor.
 */
@Component({
  selector: 'ng-core-editor-formly-field-switch',
  template: `
    <div class="custom-control custom-switch">
      <input class="custom-control-input" type="checkbox"
        [class.is-invalid]="showError"
        [indeterminate]="to.indeterminate && formControl.value === null"
        [formControl]="formControl"
        [formlyAttributes]="field">
      <label class="custom-control-label" [for]="id" [tooltip]="to.description">{{ to.label }}</label>
    </div>
  `,
})
export class SwitchComponent extends FieldType {
  defaultOptions = {
    templateOptions: {
      indeterminate: true,
      hideLabel: true,
    },
  };
}
