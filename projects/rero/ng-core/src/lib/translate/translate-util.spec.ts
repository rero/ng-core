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

import { TranslateUtil } from './translate-util';

class MockTranslateService {
  instant(value: string): string {
    return value;
  }
}

describe('TranslateUtil', () => {
  let service: MockTranslateService;
  let translate: TranslateUtil;

  beforeEach(() => {
    service = new MockTranslateService();
    translate = new TranslateUtil(service);
  });

  afterEach(() => {
    service = null;
    translate = null;
  });

  it('should create an instance', () => {
    expect(translate).toBeTruthy();
  });

  it('should translate string', () => {
    expect(translate._('String to translate')).toBe('String to translate');
  });
});
