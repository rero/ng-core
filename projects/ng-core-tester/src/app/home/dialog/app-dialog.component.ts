// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, inject } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { CONFIG } from '@rero/ng-core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-dialog',
  templateUrl: './app-dialog.component.html',
  imports: [Button, TranslatePipe],
})
export class AppDialogComponent {
  translate = inject(TranslateService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);

  confirm(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      closable: false,
      acceptLabel: this.translate.instant('Yes'),
      rejectLabel: this.translate.instant('No'),
      message: this.translate.instant('Are you sure that you want to proceed?'),
      header: this.translate.instant('Confirmation'),
      icon: 'fa fa-exclamation-triangle fa-2x ui:!text-red-500 ui:animate-pulse',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: this.translate.instant('Confirmed'),
          detail: this.translate.instant('You have accepted'),
          life: CONFIG.MESSAGE_LIFE,
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('Rejected'),
          detail: this.translate.instant('You have rejected'),
          sticky: true,
          closable: true,
        });
      },
    });
  }
}
