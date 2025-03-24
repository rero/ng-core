/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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

interface SwitchProps extends FormlyFieldProps {
  hideLabel: boolean;
}

/**
 * Component for displaying a switcher in editor.
 */
@Component({
    selector: 'ng-core-editor-formly-field-switch',
    template: `
    <div class="core:flex core:gap-2 core:my-2">
      <p-toggleswitch
        [ngClass]="{'ng-invalid ng-dirty': showError }"
        [formControl]="formControl"
        [formlyAttributes]="field"
      />
      <label [for]="id" [pTooltip]="props.description" tooltipPosition="top">{{ props.label }}</label>
    </div>
  `,
    standalone: false
})
export class SwitchComponent extends FieldType<FormlyFieldConfig<SwitchProps>> {
  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<SwitchProps>> = {
    props: {
      hideLabel: true,
    },
  };
}
