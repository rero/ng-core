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
import { TranslateLanguagePipe } from './translate-language.pipe';
import { TranslateLanguageService } from './translate-language.service';

class TranslateLanguageMock {
  translate(langCode: string) {
    return langCode + '-translate';
  }
}

describe('TranslateLanguagePipe', () => {
  const pipe = new TranslateLanguagePipe(
    new TranslateLanguageMock() as TranslateLanguageService
  );

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform language code to human language', () => {
    expect(pipe.transform('fre')).toEqual('fre-translate');
  });
});
