// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { Checkbox } from '@openng/optimus-ui/checkbox';

interface CheckboxProps extends FormlyFieldProps {
  hideLabel: boolean;
}

/**
 * Component for displaying a single binary checkbox in editor.
 */
@Component({
  selector: 'ng-core-editor-formly-field-checkbox',
  template: `
    <div class="core:flex core:items-center core:gap-2">
      <p-checkbox
        [binary]="true"
        [ngClass]="{ 'ng-invalid ng-dirty': showError }"
        [formControl]="formControl"
        [formlyAttributes]="field"
        [inputId]="id"
      />
      <label [for]="id">{{ props.label }}</label>
    </div>
  `,
  imports: [Checkbox, NgClass, ReactiveFormsModule, FormlyModule],
})
export class CheckboxComponent extends FieldType<FieldTypeConfig<CheckboxProps>> {
  /** Default properties */
  defaultOptions: Partial<FieldTypeConfig<CheckboxProps>> = {
    props: {
      hideLabel: true,
    },
  };
}
