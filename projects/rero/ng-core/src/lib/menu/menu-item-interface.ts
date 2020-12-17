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

export interface MenuItemInterface {
  setFactory(factory: MenuFactoryInterface): this;
  getName(): string;
  setName(name: string): this;
  getPrefix(): { name: string, class: string };
  setPrefix(name: string, htmlClasses?: string): this;
  removePrefix(): this;
  getSuffix(): { name: string, class: string };
  setSuffix(name: string, htmlClasses?: string): this;
  removeSuffix(): this;
  getUri(): null | string;
  setUri(uri?: string): this;
  hasUri(): boolean;
  getQueryParams(): {};
  getQueryParam(name: string, defaultValue?: null | string): null | string;
  setQueryParams(params: {}): this;
  setQueryParam(param: string, value: any): this;
  hasRouterLink(): boolean;
  getRouterLink(): string[];
  setRouterLink(routerLink?: string[]): this;
  getLabel(): null | string;
  setLabel(label?: string): this;
  getAttributes(): {};
  setAttributes(attributes: {}): this;
  getAttribute(name: string, defaultValue?: string): null | string;
  setAttribute(name: string, value: string): this;
  deleteAttribute(name: string): boolean;
  getLabelAttributes(): {};
  setLabelAttributes(labelAttributes: {}): this;
  getLabelAttribute(name: string, defaultValue?: string): null | string;
  setLabelAttribute(name: string, value: string): this;
  hasLabelAttribute(name: string): boolean;
  deleteLabelAttribute(name: string): boolean;
  hasExtra(name: string): boolean;
  getExtras(): {};
  setExtras(extras: {}): this;
  getExtra(name: string, defaultValue?: string): null | string;
  setExtra(name: string, value: string): this;
  deleteExtraAttribute(name: string): boolean;
  isActive(): boolean;
  setActive(state: boolean): this;
  isEnabled(): boolean;
  enable(): this;
  disable(): this;
  addChild(child: MenuItemInterface | string, options?: []): MenuItemInterface;
  getChild(name: string): MenuItemInterface;
  getChildren(): Array<MenuItemInterface>;
  hasChildren(): boolean;
  getLevel(): number;
  getParent(): MenuItemInterface;
  setParent(parent?: any): this;
  count(): number;
}
