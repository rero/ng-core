/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { CoreConfigService } from '../core-config.service';
import { TranslateService } from './translate-service';
import { TranslateService as NgxTranslateService } from '@ngx-translate/core';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

class TranslateServiceMock {
  private language;

  use(lang: string) {
    this.language = lang;
  }

  getBrowserLang() {
    return 'en';
  }

  get currentLang() {
    return this.language;
  }

  addLangs(languages: Array<string>) {}

  setDefaultLang(lang: string) {}
}

class BsLocaleServiceMock {
  use(lang: string) {}
}

let appTranslateService;
describe('AppTranslateService', () => {
  beforeEach(() => {
    appTranslateService = new TranslateService(
      new TranslateServiceMock() as unknown as NgxTranslateService,
      new CoreConfigService(),
      new BsLocaleServiceMock() as unknown as BsLocaleService
    );
  });
  it('should create an instance', () => {
    expect(appTranslateService).toBeTruthy();
  });

  it('should set language on appTranslateService', () => {
    expect(appTranslateService.setLanguage('fr')).toBeTruthy();
  });

  it('should get Browser language on appTranslateService', () => {
    expect(appTranslateService.getBrowserLang()).toBe('en');
  });

  it('should get Browser language on appTranslateService', () => {
    expect(appTranslateService.currentLanguage).toBe('en');
  });
});
