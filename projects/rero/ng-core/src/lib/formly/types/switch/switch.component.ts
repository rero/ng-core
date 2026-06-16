// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';

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
        [ngClass]="{ 'ng-invalid ng-dirty': showError }"
        [formControl]="formControl"
        [formlyAttributes]="field"
      />
      <label [for]="id" [pTooltip]="props.description" tooltipPosition="top">{{ props.label }}</label>
    </div>
  `,
  imports: [ToggleSwitch, NgClass, FormsModule, ReactiveFormsModule, FormlyModule, Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent extends FieldType<FieldTypeConfig<SwitchProps>> {
  /** Default properties */
  defaultOptions: Partial<FieldTypeConfig<SwitchProps>> = {
    props: {
      hideLabel: true,
    },
  };
}
