// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { Button } from '@openng/optimus-ui/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Nl2brPipe } from '../../pipe/nl2br/nl2br.pipe';

@Component({
  selector: 'ng-core-dialog',
  template: `
    <div class="core:flex core:flex-col core:gap-2">
      <div class="core:flex" [innerHtml]="config.data.body | nl2br"></div>
      <div class="core:flex core:justify-end core:gap-1">
        <p-button
          [label]="config.data.cancelTitleButton || 'Cancel' | translate"
          severity="danger"
          [outlined]="true"
          (onClick)="cancel()"
        />
        @if (config.data.confirmButton) {
          <p-button [label]="config.data.confirmTitleButton || 'OK' | translate" (onClick)="confirm()" />
        }
      </div>
    </div>
  `,
  imports: [Button, TranslatePipe, Nl2brPipe],
})
export class DialogComponent {
  config: DynamicDialogConfig = inject(DynamicDialogConfig);
  protected ref: DynamicDialogRef = inject(DynamicDialogRef);

  confirm(): void {
    this.ref.close(true);
  }

  cancel(): void {
    this.ref.close(false);
  }
}
