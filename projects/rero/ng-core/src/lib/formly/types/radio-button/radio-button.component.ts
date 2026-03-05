/*
 * RERO angular core
 * Copyright (C) 2022-2025 RERO
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
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RadioButton } from 'primeng/radiobutton';
import { Observable, of } from 'rxjs';

interface RadioButtonProps {
  options: Observable<Option[]>;
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
      <label [for]="option.value" class="core:ml-1">{{ option.untranslatedLabel | translate }}</label>
    </div>
  </ng-template>
  @if (props.style === 'stacked') {
    @for (option of props.options | async; track option.value) {
      <ng-container [ngTemplateOutlet]="radioButton" [ngTemplateOutletContext]="{option}"/>
    }
  } @else {
    <div class="core:flex core:gap-2">
    @for (option of props.options | async; track option.value) {
      <ng-container [ngTemplateOutlet]="radioButton" [ngTemplateOutletContext]="{option}"/>
    }
    </div>
  }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RadioButton, FormsModule, ReactiveFormsModule, NgTemplateOutlet, AsyncPipe, TranslatePipe]
})
export class RadioButtonComponent extends FieldType<FieldTypeConfig<RadioButtonProps>> {

  defaultOptions?: Partial<FieldTypeConfig<RadioButtonProps>> = {
    props: {
      options: of([]),
      style: 'stacked'
    }
  };

  get disabledControl() {
    return new FormControl({ value: this.formControl.value, disabled: true });
  }
}
