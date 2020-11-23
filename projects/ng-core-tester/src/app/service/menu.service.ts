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
import { MenuFactory, MenuItem } from '@rero/ng-core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  /**
   * Menu Application
   * @return MenuItem
   */
  generateApplicationMenu() {
    const factory = new MenuFactory();
    const menu = factory.createItem('Demo');
    /**
     * Definition with short syntax
     */
    menu.addChild(
      'Home',
      {
        attributes: { id: 'home' },
        labelAttributes: { hideLabel: true },
        extras: { iconClass: 'fa fa-home'}, routerlink: ['/']
      }
    );
    /**
     * Same menu with fluid syntax
     * menu.addChild('Home')
     *  .setAttribute('id', 'home')
     *  .setExtra('iconClass', 'fa fa-home')
     *  .setRouterLink(['/']);
     */

    this._recordsMenu(menu);

    /**
     * Menu with multiples attributes definition
     */
    menu.addChild('Sonar')
      .setUri('http://sonar.ch')
      .setAttributes({ id: 'sonar-link', target: '_blank' })
      .setExtra('iconClass', 'fa fa-external-link');

    this._externalLinks(menu);

    return menu;
  }

  /**
   * Generate records menu
   * @param menu - MenuItem
   */
  private _recordsMenu(menu: MenuItem) {
    const records = menu.addChild('Records');
    records.addChild('Global records')
      .setAttribute('id', 'global-records')
      .setExtra('iconClass', 'fa fa-book')
      .setRouterLink(['/record', 'search', 'documents']);
    records.addChild('UNISI records')
      .setRouterLink(['/unisi', 'record', 'search', 'documents']);
    records.addChild('Backend records')
      .setPrefix('[admin]')
      .setSuffix('[search]', 'text-warning')
      .setRouterLink(['/admin', 'record', 'search', 'documents']);
    records.addChild('Document records')
      .setRouterLink(['/records', 'documents']);
    records.addChild('Organisation records')
      .setRouterLink(['/records', 'organisations']);
  }

  /**
   * Generate external menu links
   * @param menu - MenuItem
   */
  private _externalLinks(menu: MenuItem) {
    const external = menu.addChild('External links');
    external.addChild('RERO')
      .setUri('https://www.rero.ch')
      .setAttributes({ id: 'rero-link', target: '_blank' });
  }
}
