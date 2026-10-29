// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Service } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * LocalStorageEvent interface
 */
export interface LocalStorageEvent {
  key: string;
  data: unknown;
}

/**
 * Service for managing data saved into local storage.
 */
@Service()
export class LocalStorageService {
  /**
   * Event for set data on local storage
   */
  private onSet = new Subject<LocalStorageEvent>();

  /**
   * Event for remove data on local storage
   */
  private onRemove = new Subject<unknown>();

  /**
   * Event for clear on local storage
   */
  private onClear = new Subject<unknown>();

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
   * Set a new key on LocalStorage
   * @param key - string
   * @param value - string
   * @return LocalStorageService
   */
  set(key: string, value: unknown) {
    const data = { date: new Date(), data: value };
    localStorage.setItem(key, JSON.stringify(data));
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
    if (local) {
      local.date = new Date();
      localStorage.setItem(key, JSON.stringify(local));
    }

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
    if (!local) {
      return true;
    }
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
    return this.getItem(key) !== null;
  }

  /**
   * Get local storage with the key
   *
   * A value that is not JSON was encrypted by a previous version of the
   * library: it can no longer be read, so it is removed.
   * @param key - string
   * @return the stored object, or null when there is no readable value
   */
  private getItem(key: string) {
    const value = localStorage.getItem(key);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }
}
