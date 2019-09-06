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
import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CONFIG, Config } from '@rero/ng-core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  lang: string = document.documentElement.lang;
  languages: string[];

  constructor(
    private translateService: TranslateService,
    @Inject(CONFIG) private config: Config
  ) {
    this.languages = this.config.languages;
    this.translateService.use(this.lang);
  }
  changeLang(event, lang) {
    event.preventDefault();
    this.lang = lang;
    this.translateService.use(this.lang);
  }
}
