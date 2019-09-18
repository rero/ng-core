/*

RERO ILS
Copyright (C) 2019 RERO

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { TranslateLanguageService } from './translate-language.service';

describe('TranslateLanguageService', () => {
  let service: TranslateLanguageService;
  const spy = jasmine.createSpyObj('CoreConfigService', []);

  beforeEach(() => {
    service = new TranslateLanguageService(spy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should pass languages in configuration', () => {
    spy.languages = ['en'];
    service = new TranslateLanguageService(spy);
    expect(service).toBeTruthy();
  });

  it('should have no languages passed in configuration', () => {
    expect(service.translate('fr', 'de')).toBe('fr');
  });

  it('should translate "fr" to "French"', () => {
    expect(service.translate('fr', 'en')).toBe('French');
  });

  it('should return language code because lang does not exist', () => {
    expect(service.translate('zz', 'en')).toBe('zz');
  });

  it('should return language code because translation file is not loaded', () => {
    expect(service.translate('fr', 'pt')).toBe('fr');
  });
});
