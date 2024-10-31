/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
  selector: 'ng-core-editor-formly-multi-schema-type',
  template: `
    <div class="{{ field.parent.props.cssClass }}">
      @if (props.label) {
      <legend [pTooltip]="props.description" tooltipPosition="top">{{ props.label }}</legend>
      } @if (showError && formControl.errors) {
        <div class="text-error mt-1">
          <formly-validation-message [field]="field" />
        </div>
      } @for (f of field.fieldGroup; track f) {
      <formly-field [field]="f"></formly-field>
      }
    </div>
  `,
})
export class MultiSchemaTypeComponent extends FieldType<FormlyFieldConfig> {}
