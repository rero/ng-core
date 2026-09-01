// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { CameraDetectionService } from '../../service/camera-detection/camera-detection.service';
import { BarcodeScannerDialogComponent } from './barcode-scanner-dialog/barcode-scanner-dialog.component';
import { _ } from '@ngx-translate/core';

@Component({
  selector: 'ng-core-barcode-scanner',
  imports: [Button, TranslatePipe],
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    :host ::ng-deep .p-button.p-button-text:hover {
      background: transparent;
    }

    :host-context(.p-inputgroupaddon) {
      margin: -0.5rem -0.75rem;
    }
  `,
  template: `
    @if (hasCamera()) {
      <p-button
        type="button"
        [text]="true"
        [fluid]="true"
        (onClick)="dialogOpen()"
        [ariaLabel]="ariaLabel() | translate"
        [attr.title]="ariaLabel() | translate"
        class="core:h-full core:px-3 core:flex core:items-center core:justify-center core:border-l core:border-gray-200 core:text-gray-500 core:transition-colors core:hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="core:w-5 core:h-5 core:text-gray-500"
          aria-hidden="true"
        >
          <path stroke-width="2" d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path stroke-width="2" d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path stroke-width="2" d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path stroke-width="2" d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <line x1="6" y1="8" x2="6" y2="16" stroke-width="1.5" />
          <line x1="8.5" y1="8" x2="8.5" y2="16" stroke-width="3" />
          <line x1="11.5" y1="8" x2="11.5" y2="16" stroke-width="1.5" />
          <line x1="13.5" y1="8" x2="13.5" y2="16" stroke-width="1.5" />
          <line x1="15.5" y1="8" x2="15.5" y2="16" stroke-width="3" />
          <line x1="18" y1="8" x2="18" y2="16" stroke-width="1.5" />
        </svg>
      </p-button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarcodeScannerComponent {

  private dialogService = inject(DialogService);
  private translateService = inject(TranslateService);
  private cameraDetectionService = inject(CameraDetectionService);

  protected ariaLabel = input<string>(_('Open the barcode scanner'));
  protected dialogTitle = input<string>(_('Barcode scanner'));

  protected scanned = output<string>();

  readonly hasCamera = this.cameraDetectionService.hasCamera;

  dialogOpen(): void {
    const ref = this.dialogService.open(BarcodeScannerDialogComponent, {
      header: this.translateService.instant(this.dialogTitle()),
      dismissableMask: true,
      modal: true,
      closable: true,
      style: { width: '25rem', 'min-height': '25rem' },
      breakpoints: { '640px': '90vw' },
    });
    ref?.onClose.subscribe((data: unknown) => {
      if (typeof data === 'string') {
        this.scanned.emit(data);
      }
    });
  }
}
