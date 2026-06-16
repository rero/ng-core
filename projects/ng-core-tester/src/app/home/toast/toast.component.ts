// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, OnInit, inject } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';

interface IToastType {
  name: string;
  code: string;
}

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  imports: [Select, FormsModule, InputText, Button, TranslatePipe],
})
export class ToastComponent implements OnInit {
  translateService = inject(TranslateService);
  messageService = inject(MessageService);

  toastTypes: IToastType[] = [];

  toastType: any;

  toastMessage: string | undefined;

  ngOnInit(): void {
    this.toastMessage = this.translateService.instant('This is the message');
    this.toastTypes = [
      { name: this.translateService.instant('Success'), code: 'success' },
      { name: this.translateService.instant('Info'), code: 'info' },
      { name: this.translateService.instant('Warn'), code: 'warn' },
      { name: this.translateService.instant('Error'), code: 'error' },
    ];
    this.translateService.onLangChange.subscribe(() => {
      this.toastMessage = this.translateService.instant('This is the message');
      this.toastTypes.forEach((type: any) => {
        type.name = this.translateService.instant(type.code);
      });
      this.toastType = undefined;
    });
  }

  showToast(): void {
    const message: ToastMessageOptions = {
      severity: 'error',
      summary: this.translateService.instant('Error'),
      detail: this.translateService.instant('Please select a type'),
    };
    if (this.toastType) {
      message.summary = this.toastType.code.toUpperCase();
      message.severity = this.toastType.code;
      message.text = this.toastType.name;
      message.detail = this.toastMessage;
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
