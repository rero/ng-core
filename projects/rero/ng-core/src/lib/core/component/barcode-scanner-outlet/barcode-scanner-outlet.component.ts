// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  Component,
  effect,
  inject,
  InjectionToken,
  input,
  inputBinding,
  output,
  outputBinding,
  resource,
  Type,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

/**
 * Load the barcode scanner component, set by withBarcodeScanner() of
 * @rero/ng-core/barcode-scanner.
 */
export const BARCODE_SCANNER_LOADER = new InjectionToken<() => Promise<Type<unknown>>>('BARCODE_SCANNER_LOADER');

/**
 * Display the barcode scanner when it is enabled by withBarcodeScanner(),
 * nothing otherwise.
 */
@Component({
  selector: 'ng-core-barcode-scanner-outlet',
  template: `<ng-container #container />`,
})
export class BarcodeScannerOutletComponent {
  readonly ariaLabel = input<string>();
  readonly dialogTitle = input<string>();

  readonly scanned = output<string>();

  private readonly loader = inject(BARCODE_SCANNER_LOADER, { optional: true });
  private readonly container = viewChild.required('container', { read: ViewContainerRef });
  private readonly scanner = resource({ loader: () => this.loader?.() ?? Promise.resolve(null) });

  constructor() {
    effect(() => {
      const scanner = this.scanner.value();
      if (!scanner) {
        return;
      }
      this.container().clear();
      this.container().createComponent(scanner, {
        bindings: [
          inputBinding('ariaLabel', this.ariaLabel),
          inputBinding('dialogTitle', this.dialogTitle),
          outputBinding<string>('scanned', (value) => this.scanned.emit(value)),
        ],
      });
    });
  }
}
