// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'ng-core-editor-formly-multi-schema',
  template: `
    <div [class]="field.parent?.props?.cssClass">
      @if (props.label) {
        <legend [pTooltip]="props.description" tooltipPosition="top">{{ props.label }}</legend>
      }
      @if (showError && formControl.errors) {
        <div class="text-error core:my-2">
          <formly-validation-message [field]="field" />
        </div>
      }
      @for (f of field.fieldGroup; track f.id) {
        <formly-field [field]="f"></formly-field>
      }
    </div>
  `,
  imports: [Tooltip, FormlyModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSchemaComponent extends FieldType<FormlyFieldConfig> {}
