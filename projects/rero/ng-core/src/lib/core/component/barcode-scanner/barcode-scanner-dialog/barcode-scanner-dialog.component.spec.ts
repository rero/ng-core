// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { BarcodeScannerDialogComponent } from './barcode-scanner-dialog.component';

describe('BarcodeScannerDialogComponent', () => {
  let component: BarcodeScannerDialogComponent;
  let fixture: ComponentFixture<BarcodeScannerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodeScannerDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: vi.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeScannerDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
