// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { BarcodeScannerDialogComponent } from './barcode-scanner-dialog.component';

describe('BarcodeScannerDialogComponent', () => {
  let component: BarcodeScannerDialogComponent;
  let fixture: ComponentFixture<BarcodeScannerDialogComponent>;
  let getUserMedia: ReturnType<typeof vi.fn>;

  const createComponent = async (): Promise<void> => {
    fixture = TestBed.createComponent(BarcodeScannerDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    await vi.waitFor(() => expect(component.error()).not.toBeNull(), { timeout: 5000 });
  };

  beforeEach(() => {
    getUserMedia = vi.fn();
    vi.spyOn(navigator, 'mediaDevices', 'get').mockReturnValue({ getUserMedia } as unknown as MediaDevices);

    TestBed.configureTestingModule({
      imports: [BarcodeScannerDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: vi.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['NotAllowedError', 'Camera access denied'],
    ['SecurityError', 'Camera access denied'],
    ['NotFoundError', 'No camera found'],
    ['OverconstrainedError', 'No camera found'],
    ['NotReadableError', 'Camera is already in use'],
    ['AbortError', 'Unable to start the barcode scanner'],
  ])('should display an error when getUserMedia fails with %s', async (name, message) => {
    getUserMedia.mockRejectedValue(new DOMException('error', name));
    await createComponent();

    expect(component.error()).toBe(message);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-message').textContent).toContain(message);
  });

  it('should display a generic error on an unexpected failure', async () => {
    getUserMedia.mockRejectedValue(new TypeError('mediaDevices unavailable'));
    await createComponent();

    expect(component.error()).toBe('Unable to start the barcode scanner');
  });

  it('should display a generic error when the video cannot play', async () => {
    const stop = vi.fn();
    getUserMedia.mockResolvedValue({ getTracks: () => [{ stop }] } as unknown as MediaStream);
    vi.spyOn(HTMLVideoElement.prototype, 'srcObject', 'set').mockImplementation(() => undefined);
    vi.spyOn(HTMLVideoElement.prototype, 'play').mockRejectedValue(new DOMException('error', 'AbortError'));
    await createComponent();

    expect(component.error()).toBe('Unable to start the barcode scanner');
    fixture.destroy();
    expect(stop).toHaveBeenCalled();
  });
});
