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
import { MenuFactoryInterface } from './menu-factory-interface';
import { MenuItem } from './menu-item';
import { ExtensionInterface } from './extension/extension-interface';
import { CoreExtension } from './extension/core-extension';

export class MenuFactory implements MenuFactoryInterface {

  /**
   * Extensions
   */
  private _extensions = {};

  /**
   * Sorted extensions
   */
  private _sorted: ExtensionInterface[] = [];

  /**
   * Constructor
   */
  constructor() {
    this.addExtension(new CoreExtension(), 0);
  }

  /**
   * Create item
   * @param name - name of item
   * @param options - dictionary options or null
   */
  createItem(name: string, options: {} = {}) {
    const extensions = this.getExtensions();
    Object.keys(extensions).forEach(key => {
      extensions[key].forEach((extension: ExtensionInterface) => {
        options = extension.buildOptions(options);
      });
    });

    const item = new MenuItem(name, this);
    Object.keys(extensions).forEach(priority => {
      extensions[priority].forEach((extension: ExtensionInterface) => {
        extension.buildItem(item, options);
      });
    });
    return item;
  }

  /**
   * Add extension
   * @param extension - ExtensionInterface
   * @param prioty - number
   * @return MenuFactory
   */
  addExtension(extension: ExtensionInterface, priority: number = 0) {
    if (!(priority in Object.keys(this._extensions))) {
      this._extensions[priority] = [];
    }
    this._extensions[priority].push(extension);
    this._sorted = [];

    return this;
  }

  /**
   * Sorts the internal list of extensions by priority.
   * @return ExtensionInterface[]
   */
  getExtensions(): ExtensionInterface[] {
    if (this._sorted.length === 0) {
      this._sorted = this.sortByKeys(this._extensions);
    }

    return this._sorted;
  }

  /**
   * sortByKeys
   * @param Object to sort
   */
  private sortByKeys(obj: any): any {
    return Object.keys(obj).sort().reduce(
      (acc, c) => { acc[c] = obj[c]; return acc; }, {}
    );
  }
}
