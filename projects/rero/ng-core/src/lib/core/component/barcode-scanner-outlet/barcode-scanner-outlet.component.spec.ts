// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, input, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BARCODE_SCANNER_LOADER, BarcodeScannerOutletComponent } from './barcode-scanner-outlet.component';

@Component({
  selector: 'ng-core-test-scanner',
  template: `{{ ariaLabel() }}|{{ dialogTitle() }}`,
})
class TestScannerComponent {
  readonly ariaLabel = input<string>();
  readonly dialogTitle = input<string>();
  readonly scanned = output<string>();
}

@Component({
  selector: 'ng-core-test-host',
  imports: [BarcodeScannerOutletComponent],
  template: `<ng-core-barcode-scanner-outlet ariaLabel="Scan" dialogTitle="Scanner" (scanned)="values.push($event)" />`,
})
class TestHostComponent {
  values: string[] = [];
}

describe('BarcodeScannerOutletComponent', () => {
  const render = async (enabled: boolean) => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: enabled
        ? [{ provide: BARCODE_SCANNER_LOADER, useValue: () => Promise.resolve(TestScannerComponent) }]
        : [],
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    return fixture;
  };

  it('should display nothing when the barcode scanner is not enabled', async () => {
    const fixture = await render(false);
    expect(fixture.debugElement.query(By.directive(TestScannerComponent))).toBeNull();
  });

  it('should display the scanner with its inputs when it is enabled', async () => {
    const fixture = await render(true);
    const scanner = fixture.debugElement.query(By.directive(TestScannerComponent));
    expect(scanner.nativeElement.textContent).toBe('Scan|Scanner');
  });

  it('should forward the scanned values', async () => {
    const fixture = await render(true);
    const scanner = fixture.debugElement.query(By.directive(TestScannerComponent))
      .componentInstance as TestScannerComponent;
    scanner.scanned.emit('9782918390329');
    expect(fixture.componentInstance.values).toEqual(['9782918390329']);
  });
});
