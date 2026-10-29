// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { BARCODE_SCANNER_LOADER, CoreFeature } from '@rero/ng-core';

/**
 * Enable the barcode scanner of the input fields.
 *
 * Without this feature, the scanner and its dependencies are left out of the
 * application bundle.
 */
export function withBarcodeScanner(): CoreFeature {
  return {
    ɵkind: 'barcodeScanner',
    ɵproviders: [
      {
        provide: BARCODE_SCANNER_LOADER,
        useValue: () =>
          import('./component/barcode-scanner/barcode-scanner.component').then((m) => m.BarcodeScannerComponent),
      },
    ],
  };
}
