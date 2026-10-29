// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService, ToastMessageOptions } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';

interface IToastType {
  name: string;
  code: string;
}

/** Translation key of each toast type, by severity. */
const TOAST_TYPES: Record<string, string> = {
  success: 'Success',
  info: 'Info',
  warn: 'Warn',
  error: 'Error',
};

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  imports: [Select, FormsModule, InputText, Button, TranslatePipe],
})
export class ToastComponent {
  private readonly translateService = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  /** Emits on each language change, so that the labels are translated again. */
  private readonly langChange = toSignal(this.translateService.onLangChange);

  protected readonly toastTypes = computed<IToastType[]>(() => {
    this.langChange();
    return Object.entries(TOAST_TYPES).map(([code, key]) => ({ name: this.translateService.instant(key), code }));
  });

  // Reset on language change, as the selected option belongs to the previous list.
  protected readonly toastType = linkedSignal<IToastType[], IToastType | undefined>({
    source: this.toastTypes,
    computation: () => undefined,
  });

  protected readonly toastMessage = linkedSignal<string>(() => {
    this.langChange();
    return this.translateService.instant('This is the message');
  });

  protected showToast(): void {
    const message: ToastMessageOptions = {
      severity: 'error',
      summary: this.translateService.instant('Error'),
      detail: this.translateService.instant('Please select a type'),
    };
    const toastType = this.toastType();
    if (toastType) {
      message.summary = toastType.code.toUpperCase();
      message.severity = toastType.code;
      message.text = toastType.name;
      message.detail = this.toastMessage();
    }
    if (message.severity === 'error') {
      message.sticky = true;
      message.closable = true;
    } else {
      message.life = 5000;
    }
    this.messageService.add(message);
  }
}
