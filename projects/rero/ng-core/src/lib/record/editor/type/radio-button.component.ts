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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

interface RadioButtonProps {
  options: Option[];
  style: 'stacked' | 'inline';
};

interface Option {
  label: string;
  value: string;
  disabled: boolean;
};

@Component({
    selector: 'ng-core-editor-field-radio-button',
    template: `
  <ng-template #radioButton let-option="option" let-class="class">
    <div class="core:flex">
      <p-radiobutton
        [inputId]="option.value"
        [formControl]="option.disabled ? disabledControl : formControl"
        [value]="option.value"
      />
      <label [for]="option.value" class="core:ml-1">{{option.label}}</label>
    </div>
  </ng-template>
  @if (props.style === 'stacked') {
    @for (option of props.options | formlySelectOptions : field | async; track option) {
      <ng-container [ngTemplateOutlet]="radioButton" [ngTemplateOutletContext]="{option}"/>
    }
  } @else {
    <div class="core:flex core:gap-2">
    @for (option of props.options | formlySelectOptions : field | async; track option) {
      <ng-container [ngTemplateOutlet]="radioButton" [ngTemplateOutletContext]="{option}"/>
    }
    </div>
  }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class RadioButtonComponent extends FieldType<FormlyFieldConfig<RadioButtonProps>> {

  defaultOptions?: Partial<FormlyFieldConfig<RadioButtonProps>> = {
    props: {
      options: [],
      style: 'stacked'
    }
  };

  get disabledControl() {
    return new FormControl({ value: this.formControl.value, disabled: true });
  }
}
