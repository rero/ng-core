/*
 * Invenio angular core
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
import { MenuFactory } from './menu-factory';
import { MenuItem } from './menu-item';
import { ExtensionInterface } from './extension/extension-interface';
import { MenuItemInterface } from './menu-item-interface';

class ExtensionMock implements ExtensionInterface {
  buildOptions(options: {}): {} {
    return {};
  }
  buildItem(item: MenuItemInterface, options: {}): void {
  }
}

describe('MenuFactory', () => {

  let menuFactory: MenuFactory;

  beforeEach(() => {
    menuFactory = new MenuFactory();
  });

  it('should create an instance', () => {
    expect(menuFactory).toBeTruthy();
  });

  it('should create an item', () => {
    expect(menuFactory.createItem('menu-name') instanceof MenuItem).toBeTruthy();
  });

  it('should add an extension', () => {
    expect(Object.keys(menuFactory.getExtensions()).length).toEqual(1);
    menuFactory.addExtension(new ExtensionMock(), 1);
    expect(Object.keys(menuFactory.getExtensions()).length).toEqual(2);
  });
});
