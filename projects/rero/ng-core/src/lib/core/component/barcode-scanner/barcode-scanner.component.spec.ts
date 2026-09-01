// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';

import { CameraDetectionService } from '../../service/camera-detection/camera-detection.service';
import { BarcodeScannerDialogComponent } from './barcode-scanner-dialog/barcode-scanner-dialog.component';
import { BarcodeScannerComponent } from './barcode-scanner.component';

@Component({
  selector: 'ng-core-test-host',
  imports: [BarcodeScannerComponent],
  template: `<ng-core-barcode-scanner (scanned)="scannedValues.push($event)" />`,
})
class TestHostComponent {
  scannedValues: string[] = [];
}

describe('BarcodeScannerComponent', () => {
  let component: BarcodeScannerComponent;
  let fixture: ComponentFixture<BarcodeScannerComponent>;
  let dialogServiceOpen: ReturnType<typeof vi.fn>;
  let onClose: Subject<string>;
  let hasCamera: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    onClose = new Subject<string>();
    dialogServiceOpen = vi.fn(() => ({ onClose } as unknown as DynamicDialogRef));
    hasCamera = signal(false);

    await TestBed.configureTestingModule({
      imports: [BarcodeScannerComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: { open: dialogServiceOpen } },
        { provide: CameraDetectionService, useValue: { hasCamera } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeScannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the button when a camera is available', () => {
    hasCamera.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p-button')).toBeTruthy();
  });

  it('should hide the button when no camera is available', () => {
    hasCamera.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p-button')).toBeFalsy();
  });

  it('should open the scanner dialog with the translated title', () => {
    component.dialogOpen();

    expect(dialogServiceOpen).toHaveBeenCalledWith(BarcodeScannerDialogComponent, {
      header: 'Barcode scanner',
      dismissableMask: true,
      modal: true,
      closable: true,
      style: { width: '25rem', 'min-height': '25rem' },
      breakpoints: { '640px': '90vw' },
    });
  });

  it('should emit the scanned value when the dialog closes', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    const host = hostFixture.componentInstance;
    const scannerComponent = hostFixture.debugElement.children[0].componentInstance as BarcodeScannerComponent;

    scannerComponent.dialogOpen();
    onClose.next('9782918390329');

    expect(host.scannedValues).toEqual(['9782918390329']);
  });
});
