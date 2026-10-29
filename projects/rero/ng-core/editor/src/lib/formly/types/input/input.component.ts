// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputText } from '@openng/optimus-ui/inputtext';
import { BARCODE_SCANNER_LOADER, BarcodeScannerOutletComponent, CameraDetectionService } from '@rero/ng-core';

export interface NgCoreFormlyInputFieldConfig extends FormlyFieldConfig {
  type: 'input' | Type<InputComponent>;
  addonRight?: string[];
  addonLeft?: string[];
  barcodeScanner?: {
    ariaLabel?: string;
    dialogTitle?: string;
  };
  class?: string;
  step?: 'any' | number;
  locale?: string;
  showButtons?: boolean;
  useGrouping?: boolean;
}

@Component({
  selector: 'ng-core-formly-field-optimus-ui-input',
  template: `
    @if (props.barcodeScanner && (props.type ?? 'text') === 'text') {
      <p-inputgroup>
        <ng-container [ngTemplateOutlet]="addons" [ngTemplateOutletContext]="{ $implicit: props.addonLeft }" />
        <ng-container [ngTemplateOutlet]="input" [ngTemplateOutletContext]="{ formControl, props, field, showError }" />
        <ng-container [ngTemplateOutlet]="addons" [ngTemplateOutletContext]="{ $implicit: props.addonRight }" />
        @if (hasCamera()) {
          <p-inputgroup-addon>
            <ng-core-barcode-scanner-outlet
              [ariaLabel]="props.barcodeScanner.ariaLabel"
              [dialogTitle]="props.barcodeScanner.dialogTitle"
              (scanned)="formControl.setValue($event)" />
          </p-inputgroup-addon>
        }
      </p-inputgroup>
    } @else if (props.addonLeft || props.addonRight) {
      <p-inputgroup>
        <ng-container [ngTemplateOutlet]="addons" [ngTemplateOutletContext]="{ $implicit: props.addonLeft }" />
        <ng-container [ngTemplateOutlet]="input" [ngTemplateOutletContext]="{ formControl, props, field, showError }" />
        <ng-container [ngTemplateOutlet]="addons" [ngTemplateOutletContext]="{ $implicit: props.addonRight }" />
      </p-inputgroup>
    } @else {
      <ng-container [ngTemplateOutlet]="input" [ngTemplateOutletContext]="{ formControl, props, field, showError }" />
    }
    <ng-template #addons let-addonProps>
      @for (prop of addonProps; track prop) {
        <p-inputgroup-addon [innerHTML]="prop"></p-inputgroup-addon>
      }
    </ng-template>
    <ng-template #input let-formControl="formControl" let-props="props" let-field="field" let-showError="showError">
      @if (props.type === 'number') {
        <p-inputnumber
          #inputNumber
          [attr.tabindex]="-1"
          [inputStyleClass]="props.class"
          [locale]="props.locale"
          [useGrouping]="props.useGrouping ?? false"
          [step]="props.step === 'any' ? undefined : (props.step ?? 0.01)"
          [minFractionDigits]="0"
          [maxFractionDigits]="props.step === 'any' ? 20 : decimalPlaces(props.step ?? 0.01)"
          [showButtons]="props.showButtons ?? true"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [ngClass]="{ 'ng-invalid ng-dirty': showError }"
          (focus)="inputNumber.input.nativeElement.focus()"
          (onFocus)="field.focus = true"
          (onBlur)="field.focus = false" />
      } @else {
        <input
          pInputText
          [class]="props.class"
          [type]="props.type || 'text'"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [ngClass]="{ 'ng-invalid ng-dirty': showError }" />
      }
    </ng-template>
  `,
  imports: [
    InputGroup,
    InputGroupAddon,
    NgTemplateOutlet,
    FormsModule,
    InputText,
    InputNumber,
    ReactiveFormsModule,
    FormlyModule,
    NgClass,
    BarcodeScannerOutletComponent,
  ],
})
export class InputComponent extends FieldType<NgCoreFormlyInputFieldConfig> {
  // The camera is only detected when the barcode scanner is enabled.
  readonly hasCamera = inject(BARCODE_SCANNER_LOADER, { optional: true })
    ? inject(CameraDetectionService).hasCamera
    : signal(false).asReadonly();

  defaultOptions? = {
    props: {
      class: 'core:w-full',
    },
  };

  decimalPlaces(step: 'any' | number | undefined): number {
    if (!step || step === 'any') return 0;
    const parts = step.toString().split('.');
    return parts.length > 1 ? parts[1].length : 0;
  }
}
