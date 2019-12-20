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
import { CryptoJsService } from './crypto-js.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  /**
   * Event for set data on local storage
   */
  private onSet: Subject<LocalStorageEvent> = new Subject();

  /**
   * Event for remove data on local storage
   */
  private onRemove: Subject<any> = new Subject();

  /**
   * Event for clear on local storage
   */
  private onClear: Subject<any> = new Subject();

  /**
   * On set observable
   * @return onSet subject observable
   */
  get onSet$() {
    return this.onSet.asObservable();
  }

  /**
   * On remove observable
   * @return onRemove subject observable
   */
  get onRemove$() {
    return this.onRemove.asObservable();
  }

  /**
   * On clear observable
   * @return onClear subject observable
   */
  get onClear$() {
    return this.onClear.asObservable();
  }

  /**
   * Constructor
   */
  constructor(private cryptoService: CryptoJsService) {}

  /**
   * Set a new key on LocalStorage
   * @param key - string
   * @param value - string
   * @return LocalStorageService
   */
  set(key: string, value: any) {
    const data = { date: new Date(), data: value };
    localStorage.setItem(key, this.cryptoService.encrypt(
      JSON.stringify(data)
    ));
    this.onSet.next({ key, data });

    return this;
  }

  /**
   * Update date of current object qualified by the key
   * @param key - string
   * @return LocalStorageService;
   */
  updateDate(key: string) {
    const local = this.getItem(key);
    local.date = new Date();
    localStorage.setItem(key, this.cryptoService.encrypt(
      JSON.stringify(local)
    ));

    return this;
  }

  /**
   * Return the status of current object qualified by the key
   * @param key - string
   * @param seconds - number of seconds session expired
   * @return boolean
   */
  isExpired(key: string, seconds: number) {
    const local = this.getItem(key);
    const today = new Date();
    const localDate = new Date(local.date);
    localDate.setSeconds(localDate.getSeconds() + seconds);

    return today > localDate;
  }

  /**
   * Return JSON content of the LocaleStorage
   * @param key - string
   * @param field - string (default: data)
   * @return JSON
   */
  get(key: string, field = 'data') {
    const local = this.getItem(key);
    return local ? local[field] : null;
  }

  /**
   * Remove a key of LocaleStorage
   * @param key - string
   * @return LocalStorageService
   */
  remove(key: string) {
    localStorage.removeItem(key);
    this.onRemove.next(null);

    return this;
  }

  /**
   * Clear LocaleStorage
   * @return LocalStorageService
   */
  clear() {
    localStorage.clear();
    this.onClear.next(null);

    return this;
  }

  /**
   * has key in LocaleStorage
   * @param key - string
   * @return Boolean
   */
  has(key: string) {
    return this.keys().indexOf(key) > -1;
  }

  /**
   * Get local storage with the key
   * @param key - string
   */
  private getItem(key: string) {
    return JSON.parse(this.cryptoService.decrypt(
      localStorage.getItem(key)
    ));
  }

  /**
   * Return keys of LocaleStorage
   * @return array
   */
  private keys() {
    return Object.keys(localStorage);
  }
}

/**
 * LocalStorageEvent interface
 */
export interface LocalStorageEvent {
  key: string;
  data: any;
}
