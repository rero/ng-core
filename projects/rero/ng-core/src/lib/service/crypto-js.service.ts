/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { CoreConfigService } from '../core-config.service';

@Injectable({
  providedIn: 'root'
})
export class CryptoJsService {

  constructor(private coreConfigService: CoreConfigService) { }

  encrypt(value: string) {
    const _key = this.secretPassphrase();
    return CryptoJS.AES.encrypt(value, _key, { iv: _key });
  }

  decrypt(value: string) {
    const _key = this.secretPassphrase();
    return CryptoJS.AES.decrypt(value, _key, { iv: _key }).toString(CryptoJS.enc.Utf8);
  }

  private secretPassphrase() {
    return CryptoJS.enc.Utf8.parse(this.coreConfigService.secretPassphrase);
  }
}
