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
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuFactory, MenuItem } from '@rero/ng-core';

@Injectable({
  providedIn: 'root'
})
export class AppMenuService {

  /** Menu Factory */
  private _factory: MenuFactory;

  /**
   * Constructor
   * @param _translate - TranslateService
   */
  constructor(private _translate: TranslateService) {
    this._factory = new MenuFactory();
  }

  /**
   * Application Menu
   * @return MenuItem
   */
  generateApplicationMenu() {
    const menu = this._factory.createItem('Application');

    /* Home */
    menu
      .addChild('Home')
      .setAttribute('id', 'home')
      .setExtra('iconClass', 'fa fa-home')
      .setRouterLink(['/']);

    const records = menu.addChild('Records');
    this._recordsMenu(records);

    return menu;
  }

  /**
   * Menu Languages
   * @return MenuItem
   */
  generateLanguageMenu(languages: string[], currentLanguage: string) {
    const languagesMenu = this._factory.createItem('Language');
    languages.forEach(lang => {
      const languageMenu = languagesMenu
      .addChild(this._translate.instant(lang));
      if (lang === currentLanguage) {
        languageMenu
          .setLabelAttribute('class', 'font-weight-bold')
          .setActive(true);
      }
    });

    return languagesMenu;
  }

  /**
   * Sub Menu Records
   * @param menu - MenuItem
   */
  private _recordsMenu(menu: MenuItem) {
    menu.addChild('Global records')
      .setAttribute('id', 'app-global-records')
      .setExtra('iconClass', 'fa fa-book')
      .setRouterLink(['/records', '/record', 'search', 'documents']);
    menu.addChild('UNISI records')
      .setRouterLink(['/records', '/unisi', 'search', 'documents']);
    menu.addChild('Backend records')
      .setRouterLink(['/records', '/admin', 'search', 'documents']);
    menu.addChild('Document records')
      .setRouterLink(['/records', 'documents']);
    menu.addChild('Organisation records')
      .setRouterLink(['/records', 'organisations']);
    menu.addChild('Editor')
      .setRouterLink(['/records', 'editor'])
      .setExtra('iconClass', 'fa fa-edit');
  }
}
