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
import { ItemInterface } from '../item-interface';

export interface ExtensionInterface {
  /**
   * Builds the full option array used to configure the item.
   * @param options The options processed by the previous extensions
   * @return array
   */
  buildOptions(options: {}): {};

  /**
   * Configures the item with the passed options
   * @param item - ItemInterface
   * @param options - array
   */
  buildItem(item: ItemInterface, options: {}): void;
}
