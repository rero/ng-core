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
import { Injectable, Inject } from '@angular/core';
import * as I18nIsoLanguages from '@cospired/i18n-iso-languages';

import { CONFIG, Config } from '../core.config';

declare const require: any;

@Injectable()
export class TranslateLanguageService {
  private _languages = ['en'];

  constructor(
    @Inject(CONFIG) private config: Config
  ) {
    if (this.config.languages && this.config.languages.length) {
      this._languages = config.languages;
    }

    for (const lang of this._languages) {
      try {
        I18nIsoLanguages.registerLocale(
          require('@cospired/i18n-iso-languages/langs/' + lang + '.json')
        ); 
      } catch (error) {
        
      }
    }
  }

  public translate(isocode: string, language: string) {
    if (I18nIsoLanguages.langs().indexOf(language) < 0) {
      console.log('Missing language translation file loaded: ' + language);
      return isocode;
    } else {
      let translation = I18nIsoLanguages.getName(isocode, language);
      if (undefined === translation) {
        translation = isocode;
      }
      return translation;
    }
  }
}
