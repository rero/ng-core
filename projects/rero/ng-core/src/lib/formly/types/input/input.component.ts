// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { NgTemplateOutlet, NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';

export interface NgCoreFormlyInputFieldConfig extends FormlyFieldConfig {
  type: 'input' | Type<InputComponent>;
  addonRight?: string[];
  addonLeft?: string[];
  class?: string;
  inputStep?: string | number;
}

@Component({
  selector: 'ng-core-formly-field-primeng-input',
  template: `
    @if (props.addonLeft || props.addonRight) {
      <p-inputgroup>
        @if (props.addonLeft) {
          @for (prop of props.addonLeft; track prop) {
            <p-inputgroup-addon [innerHTML]="prop"></p-inputgroup-addon>
          }
        }
        <ng-container [ngTemplateOutlet]="input" [ngTemplateOutletContext]="{ formControl, props, field, showError }" />
        @if (props.addonRight) {
          @for (prop of props.addonRight; track prop) {
            <p-inputgroup-addon [innerHTML]="prop"></p-inputgroup-addon>
          }
        }
      </p-inputgroup>
    } @else {
      <ng-container [ngTemplateOutlet]="input" [ngTemplateOutletContext]="{ formControl, props, field, showError }" />
    }
    <ng-template #input let-formControl="formControl" let-props="props" let-field="field" let-showError="showError">
      @if (props.type === 'number') {
        <input
          pInputText
          [class]="props.class"
          type="number"
          [attr.step]="props.inputStep"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [ngClass]="{ 'ng-invalid ng-dirty': showError }"
        />
      } @else {
        <input
          pInputText
          [class]="props.class"
          [type]="props.type || 'text'"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [ngClass]="{ 'ng-invalid ng-dirty': showError }"
        />
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputGroup,
    InputGroupAddon,
    NgTemplateOutlet,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    FormlyModule,
    NgClass,
  ],
})
export class InputComponent extends FieldType<NgCoreFormlyInputFieldConfig> {
  defaultOptions? = {
    props: {
      class: 'core:w-full',
      inputStep: 'number',
    },
  };
}
