// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { signal } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { BARCODE_SCANNER_LOADER, CameraDetectionService } from '@rero/ng-core';
import { BarcodeScannerComponent } from '@rero/ng-core/barcode-scanner';

import { InputComponent, NgCoreFormlyInputFieldConfig } from './input.component';

const hasCamera = signal(false);

const renderComponent = (field: NgCoreFormlyInputFieldConfig, barcodeScanner = true) => {
  return createFieldComponent(field, {
    imports: [
      InputComponent,
      FormlyModule.forRoot({
        types: [{ name: 'input', component: InputComponent }],
      }),
    ],
    providers: [
      provideTranslateService(),
      { provide: CameraDetectionService, useValue: { hasCamera } },
      { provide: DialogService, useValue: { open: vi.fn() } },
      barcodeScanner
        ? [{ provide: BARCODE_SCANNER_LOADER, useValue: () => Promise.resolve(BarcodeScannerComponent) }]
        : [],
    ],
  });
};

describe('ui-optimus-ui: NgCore Input Type', () => {
  it('should render input type with addon', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        addonLeft: ['Left'],
        addonRight: ['Right', 'RightBis'],
      },
    });
    expect(query('p-inputgroup')).not.toBeNull();
    const nodes = query('p-inputgroup').nativeElement.querySelectorAll('p-inputgroup-addon');
    expect(nodes[0].textContent).toBe('Left');
    expect(nodes[1].textContent).toBe('Right');
    expect(nodes[2].textContent).toBe('RightBis');
  });

  it('should not have the step attribute on a field that is not of type number', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
    });
    expect(query('input')).not.toBeNull();
    const { attributes } = query('input');
    expect(attributes.type).toEqual('text');
    expect(attributes.step).toBeUndefined();
  });

  it('should have the default step and maxFractionDigits on a number field', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
      },
    });
    expect(query('p-inputnumber')).not.toBeNull();
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.step()).toEqual(0.01);
    expect(inputNumber.maxFractionDigits).toEqual(2);
  });

  it('should have step and maxFractionDigits set from a custom step', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
        step: 0.5,
      },
    });
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.step()).toEqual(0.5);
    expect(inputNumber.maxFractionDigits).toEqual(1);
  });

  it('should have no step and maxFractionDigits set to 20 when step is any', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
        step: 'any' as any,
      },
    });
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.step()).toBeUndefined();
    expect(inputNumber.maxFractionDigits).toEqual(20);
  });

  it('should render p-inputnumber for a number field regardless of locale', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
      },
    });
    expect(query('p-inputnumber')).not.toBeNull();
    expect(query('input[type="number"]')).toBeNull();
  });

  it('should focus the input inside a number field', async () => {
    const { field, fixture, query } = renderComponent({
      key: 'price',
      type: 'input',
      props: {
        type: 'number',
      },
    });
    const input = query('p-inputnumber').componentInstance.input.nativeElement;

    field.focus = true;
    await fixture.whenStable();

    expect(document.activeElement).toBe(input);
  });

  it('should show buttons by default on a number field', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
      },
    });
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.showButtons).toBe(true);
  });

  it('should hide buttons when showButtons is set to false', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
        showButtons: false,
      },
    });
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.showButtons).toBe(false);
  });

  describe('barcode scanner', () => {
    it('should not render the scanner button when no camera is available', async () => {
      hasCamera.set(false);
      const { fixture, query } = renderComponent({
        key: 'name',
        type: 'input',
        props: {
          barcodeScanner: {},
        },
      });
      await fixture.whenStable();
      expect(query('ng-core-barcode-scanner')).toBeNull();
    });

    it('should render the scanner button when a camera is available', async () => {
      hasCamera.set(true);
      const { fixture, query } = renderComponent({
        key: 'name',
        type: 'input',
        props: {
          barcodeScanner: {},
        },
      });
      await fixture.whenStable();
      expect(query('p-inputgroup')).not.toBeNull();
      expect(query('ng-core-barcode-scanner')).not.toBeNull();
    });

    it('should not render the scanner button when barcodeScanner is not set', async () => {
      hasCamera.set(true);
      const { fixture, query } = renderComponent({
        key: 'name',
        type: 'input',
      });
      await fixture.whenStable();
      expect(query('ng-core-barcode-scanner')).toBeNull();
    });

    it('should not render the scanner button on a non-text field', async () => {
      hasCamera.set(true);
      const { fixture, query } = renderComponent({
        key: 'name',
        type: 'input',
        props: {
          type: 'number',
          barcodeScanner: {},
        },
      });
      await fixture.whenStable();
      expect(query('ng-core-barcode-scanner')).toBeNull();
    });

    it('should render addons alongside the scanner button', async () => {
      hasCamera.set(true);
      const { fixture, query, queryAll } = renderComponent({
        key: 'name',
        type: 'input',
        props: {
          barcodeScanner: {},
          addonLeft: ['Left'],
        },
      });
      await fixture.whenStable();
      expect(query('ng-core-barcode-scanner')).not.toBeNull();
      const addonTexts = queryAll('p-inputgroup-addon').map((addon) => addon.nativeElement.textContent);
      expect(addonTexts.some((text) => text.includes('Left'))).toBe(true);
    });

    it('should update the form control when a value is scanned', async () => {
      hasCamera.set(true);
      const { field, fixture, query } = renderComponent({
        key: 'name',
        type: 'input',
        props: {
          barcodeScanner: {},
        },
      });
      await fixture.whenStable();
      const scanner = query('ng-core-barcode-scanner').componentInstance as {
        scanned: { emit: (value: string) => void };
      };
      scanner.scanned.emit('9782918390329');
      expect(field.formControl?.value).toBe('9782918390329');
    });

    it('should not render the scanner when the feature is not enabled', async () => {
      hasCamera.set(true);
      const { fixture, query } = renderComponent(
        {
          key: 'name',
          type: 'input',
          props: {
            barcodeScanner: {},
          },
        },
        false,
      );
      await fixture.whenStable();
      expect(query('ng-core-barcode-scanner-outlet')).toBeNull();
      expect(query('ng-core-barcode-scanner')).toBeNull();
    });
  });
});
