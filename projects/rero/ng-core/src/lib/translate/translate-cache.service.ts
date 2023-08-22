/*
 * RERO angular core
 * Copyright (C) 2020-2023 RERO
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
import { CoreConfigService } from '../core-config.service';
import { ICache } from '../interface/icache';
import { LocalStorageService } from '../service/local-storage.service';

export interface ITranslations {
  version: string;
  storageName: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TranslateCacheService implements ICache {

  /** Name of local storage history */
  readonly translateHistoryName: string = 'translations';

  /**
   * Constructor
   * @param localeStorage LocalStorageService
   * @param coreConfigService CoreConfigService
   */
  constructor(
    private localeStorage: LocalStorageService,
    private coreConfigService: CoreConfigService
  ) {
    if (this.coreConfigService.appVersion === undefined) {
      throw new Error('Please set your application version to use the cache.');
    }
  }

  /**
   * Adding content to locale storage
   * @param key - Locale storage key
   * @param data - Locale storage contents
   * @returns TranslateCacheService
   */
  set(key: string, data: any): this {
    const history = this.localeStorage.has(this.translateHistoryName)
      ? this.localeStorage.get(this.translateHistoryName)
      : this.initializeTranslationsHistory();
    const name = this.storageName(key);
    if (!history.storageName.includes(name)) {
      history.storageName.push(name);
      this.localeStorage.set(this.translateHistoryName, history);
    }
    this.localeStorage.set(name, data);
    return this;
  }

  /**
   * Retrieving content from locale storage
   * @param key - Locale storage key
   * @returns The contents of the locale storage or undefined
   */
  get(key: string): any | undefined {
    if (this.localeStorage.has(this.translateHistoryName)) {
      const history = this.localeStorage.get(this.translateHistoryName);
      if (history.version !== this.coreConfigService.appVersion) {
        this.resetTranslationsHistory(history);
      } else {
        const name = this.storageName(key);
        if (history.storageName.includes(name) && this.localeStorage.has(name)) {
          return this.localeStorage.get(name);
        }
      }
    }
    return;
  }

  /**
   * Key generation for translations
   * @param language - current language
   * @returns Key name for locale storage
   */
  private storageName(language: string): string {
    return `${this.translateHistoryName}_${language}`;
  }

  /**
   * Delete languages in locale storage and reset object history.
   * @param history - history object (ITranslations)
   */
  private resetTranslationsHistory(history: ITranslations): void {
    history.storageName.forEach(name => {
      if (this.localeStorage.has(name)) {
        this.localeStorage.remove(name);
      }
    });
    this.localeStorage.set(this.translateHistoryName, this.initializeTranslationsHistory());
  }

  /**
   * Generate object history stored in locale storage.
   * @returns - ITranslations
   */
  private initializeTranslationsHistory(): ITranslations {
    return {
      version: this.coreConfigService.appVersion,
      storageName: []
    }
  }
}
