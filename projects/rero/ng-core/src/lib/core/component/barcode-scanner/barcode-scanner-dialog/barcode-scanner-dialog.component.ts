// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';

@Component({
  selector: 'ng-core-barcode-scanner-dialog',
  imports: [Message],
  template: `
  @if (error()) {
    <p-message severity="error" styleClass="core:w-full core:mb-4">{{ error() }}</p-message>
  }

  <video #video class="core:w-full core:aspect-square core:rounded-lg core:object-cover"></video>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarcodeScannerDialogComponent {

  private readonly translateService = inject(TranslateService);
  private readonly dynamicDialogRef = inject(DynamicDialogRef);
  private readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('video');
  private stream?: MediaStream;
  private scanFrameId?: number;
  private stopped = false;

  readonly error = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.startScanner());
    inject(DestroyRef).onDestroy(() => this.stopScanner());
  }

  private async startScanner(): Promise<void> {
    const video = this.videoElement()?.nativeElement;
    if (!video) {
      return;
    }

    const { BarcodeDetector, prepareZXingModule } = await import('barcode-detector/ponyfill');
    await prepareZXingModule({
      overrides: {
        locateFile: (path: string, prefix: string) =>
          path.endsWith('.wasm') ? new URL(path, window.location.origin).href : prefix + path,
      },
      fireImmediately: true,
    });
    const detector = new BarcodeDetector();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
    } catch {
      this.error.set(this.translateService.instant('Camera access denied'));
      return;
    }

    video.srcObject = this.stream;
    await video.play();
    this.scanFrame(video, detector);
  }

  private scanFrame(video: HTMLVideoElement, detector: import('barcode-detector/ponyfill').BarcodeDetector): void {
    this.scanFrameId = requestAnimationFrame(async () => {
      if (this.stopped) {
        return;
      }
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        try {
          const [barcode] = await detector.detect(video);
          if (this.stopped) {
            return;
          }
          if (barcode) {
            this.dynamicDialogRef.close(barcode.rawValue);
            return;
          }
        } catch {
          // A single failed detection frame is expected while scanning; keep retrying.
        }
      }
      this.scanFrame(video, detector);
    });
  }

  private stopScanner(): void {
    this.stopped = true;
    if (this.scanFrameId !== undefined) {
      cancelAnimationFrame(this.scanFrameId);
    }
    this.stream?.getTracks().forEach((track) => track.stop());
  }
}
