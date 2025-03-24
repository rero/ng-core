/*
 * RERO angular core
 * Copyright (C) 2024-2025 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Component, OnInit, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ToastMessageOptions } from 'primeng/api';

interface IToastType {
  name: string;
  code: string;
}

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    standalone: false
})
export class ToastComponent implements OnInit {

  translateService = inject(TranslateService);
  messageService = inject(MessageService);

  toastTypes: IToastType[];

  toastType: any;

  toastMessage: string;

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
      detail: this.translateService.instant('Please select a type')
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
