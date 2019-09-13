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
import { TestBed } from '@angular/core/testing';

import { TranslateLoader } from './translate-loader';

describe('TranslateLoader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const translateLoader = new TranslateLoader({});
    expect(translateLoader).toBeTruthy();

  });

  it('should override translation', () => {
    const config = {
      languages: ['fr'],
      customTranslations: {
        fr: {
          'your query': 'Traduction surchargée',
        }
      }
    };

    const translateLoader = new TranslateLoader(config);
    translateLoader.getTranslation('fr').subscribe(translations => {
      expect(translations['your query']).toBe(config.customTranslations.fr['your query']);
    });
  });

  it('should throw an error because translations for language not found', () => {
    const config = {
      languages: ['fr']
    };

    const translateLoader = new TranslateLoader(config);
    expect(() => translateLoader.getTranslation('pt')).toThrowError('Translations not found for lang "pt"');
  });

  it('should not find custom translation for "en" language', () => {
    const config = {
      languages: ['fr', 'en'],
      customTranslations: {
        fr: {
          'your query': 'Traduction surchargée',
        }
      }
    };

    const translateLoader = new TranslateLoader(config);
    translateLoader.getTranslation('en').subscribe(translations => {
      expect(translations['your query']).toBe('your query');
    });
  });
});
