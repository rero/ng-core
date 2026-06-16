// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { CoreConfigService } from '../core-config/core-config.service';

@Injectable({
  providedIn: 'root',
})
export class CryptoJsService {
  protected coreConfigService: CoreConfigService = inject(CoreConfigService);

  encrypt(value: string): string {
    const _key = this.secretPassphrase();
    return CryptoJS.AES.encrypt(value, _key, { iv: _key }).toString();
  }

  decrypt(value: string) {
    const _key = this.secretPassphrase();
    return CryptoJS.AES.decrypt(value, _key, { iv: _key }).toString(CryptoJS.enc.Utf8);
  }

  private secretPassphrase(): CryptoJS.lib.WordArray {
    return CryptoJS.enc.Utf8.parse(this.coreConfigService.secretPassphrase);
  }
}
