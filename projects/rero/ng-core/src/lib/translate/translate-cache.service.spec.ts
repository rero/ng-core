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
import { TestBed } from '@angular/core/testing';
import { TranslateCacheService } from './translate-cache.service';
import { CoreConfigService } from '../core-config.service';
import { LocalStorageService } from '../service/local-storage.service';

class AppConfigService extends CoreConfigService {
  constructor() {
    super();
    this.appVersion = '1.0.0';
  }
}

export const translations = {
  foo: 'bar'
};

export const historyLocaleStorage1 = {
  version: '1.0.0',
  storageName: ['translations_fr', 'translations_de']
};

export const historyLocaleStorage11 = {
  version: '1.0.1',
  storageName: []
};

describe('TranslateCacheService', () => {
  let service: TranslateCacheService;
  let localeStorage: LocalStorageService;
  let appConfigService: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CoreConfigService, useClass: AppConfigService }
      ]
    });
    service = TestBed.inject(TranslateCacheService);
    localeStorage = TestBed.inject(LocalStorageService);
    appConfigService = TestBed.inject(CoreConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should return the correct cache values', () => {
    localeStorage.clear();
    expect(service.get('fr')).toBeUndefined();
    service.set('fr', translations);
    expect(service.get('fr')).toEqual(translations);
    expect(service.get('de')).toBeUndefined();
    service.set('de', translations);
    const history = localeStorage.get(service.translateHistoryName);
    expect(history).toEqual(historyLocaleStorage1);
    const {storageName} = history;
    storageName.forEach((name: string) => expect(localeStorage.has(name)).toBeTrue());
    // Application version change
    // The translation cache is cleared
    appConfigService.appVersion = '1.0.1';
    expect(service.get('fr')).toBeUndefined();
    expect(localeStorage.get(service.translateHistoryName)).toEqual(historyLocaleStorage11);
    storageName.forEach((name: string) => expect(localeStorage.has(name)).toBeFalse());
  });
});
