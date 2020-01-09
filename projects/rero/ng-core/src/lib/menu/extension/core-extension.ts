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
import { cloneDeep } from 'lodash-es';
import { ItemInterface } from '../item-interface';
import { ExtensionInterface } from './extension-interface';
import { OptionsInterface } from './options-interface';

export class CoreExtension implements ExtensionInterface {

  /** Core Options */
  private _coreOptions = {
    uri: null,
    routerLink: [],
    label: null,
    attributes: {},
    labelAttributes: {},
    extras: {}
  };

  /**
   * Builds the full option array used to configure the item.
   *
   * @param options - dictionary of options
   * @return OptionsInterface
   */
  buildOptions(options: {}): OptionsInterface {
    return { ...cloneDeep(this._coreOptions), ...options };
  }

  /**
   * Configures the newly created item with the passed options
   * @param item - ItemInterface
   * @param options - OptionsInterface
   */
  buildItem(item: ItemInterface, options: OptionsInterface) {
    item
      .setUri(options.uri)
      .setRouterLink(options.routerLink)
      .setLabel(options.label)
      .setAttributes(options.attributes)
      .setLabelAttributes(options.labelAttributes)
      .setExtras(options.extras)
    ;
  }
}
