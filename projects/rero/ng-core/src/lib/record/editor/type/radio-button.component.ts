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
    <div class="flex" [ngClass]="class">
      <p-radioButton
        [formControl]="option.disabled ? disabledControl : formControl"
        [label]="option.label"
        [value]="option.value"
      />
    </div>
  </ng-template>
  @if (props.style === 'stacked') {
    @for (option of props.options | formlySelectOptions : field | async; track option; let i = $index;) {
      <ng-container [ngTemplateOutlet]="radioButton" [ngTemplateOutletContext]="{option, class: 'radio-button'}"/>
    }
  } @else {
    <div class="flex flex-wrap">
    @for (option of props.options | formlySelectOptions : field | async; track option; let i = $index;) {
      <ng-container [ngTemplateOutlet]="radioButton" [ngTemplateOutletContext]="{option, class: 'radio-button-label'}"/>
    }
    </div>
  }
  `,
  styles: `
  .radio-button {
    margin-bottom: 4px;
  }
  .radio-button-label {
    margin-top: 4px;
    margin-bottom: 4px;
    margin-right: 10px;
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
