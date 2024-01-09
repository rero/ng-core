/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { MenuItemInterface } from './menu-item-interface';
import { MenuFactoryInterface } from './menu-factory-interface';

export class MenuItem implements MenuItemInterface {

  /** Menu name */
  private name: string;

  /** Prefix */
  private prefix: {
    name: string,
    class: string
  };

  /** Suffix */
  private suffix: {
    name: string,
    class: string
  };

  /** Factory */
  private factory: MenuFactoryInterface;

  /** Parent menuItem */
  private parent?: MenuItemInterface;

  /** Children of menuItem */
  private children = [];

  /** Uri */
  private uri?: string;

  /** Uri params */
  private queryParams = {};

  /** Angular router link */
  private routerLink: string[];

  /** Label of menu */
  private label?: string;

  /** Attributes */
  private attributes = {};

  /** Label attributes */
  private labelAttributes = {};

  /** Extra attributes */
  private extras = {};

  /** Active menu */
  private active = false;

  /** Is the menu is enabled */
  private enabled = true;


  /**
   * Constructor
   * @param name - string
   * @param factory - MenuFactoryInterface or null
   */
  constructor(name: string, factory?: MenuFactoryInterface) {
    this.name = name;
    if (factory) {
      this.setFactory(factory);
    }
  }

  /**
   * Set Factory
   * @param factory - MenuFactoryInterface
   * @return MenuItem
   */
  setFactory(factory: MenuFactoryInterface): this {
    this.factory = factory;
    return this;
  }

  /**
   * has factory
   * @return boolean
   */
  hasFactory() {
    return !!this.factory;
  }

  /**
   * Get name
   * @return string, name of menu
   */
  getName() {
    return this.name;
  }

  /**
   * Set name
   * @param name - string, set name of menu
   * @return MenuItem
   */
  setName(name: string): this {
    if (this.name === name) {
      return this;
    }
    this.name = name;
    return this;
  }

  /**
   * Get Prefix
   * @return Object with name and class properties
   */
  getPrefix() {
    return this.prefix;
  }

  /**
   * Set Prefix
   * @param name - string
   * @param htmlClasses - string
   * @return MenuItem
   */
  setPrefix(name: string, htmlClasses?: string): this {
    this.prefix = this._setPrefixSuffix(name, htmlClasses);
    return this;
  }

  /**
   * Remove Prefix
   * @return MenuItem
   */
  removePrefix(): this {
    this.prefix = undefined;
    return this;
  }

  /**
   * Get Suffix
   * @return Object with name and class properties
   */
  getSuffix() {
    return this.suffix;
  }

  /**
   * Set Suffix
   * @param name - string
   * @param htmlClasses - string
   * @return MenuItem
   */
  setSuffix(name: string, htmlClasses?: string): this {
    this.suffix = this._setPrefixSuffix(name, htmlClasses);
    return this;
  }

  /**
   * Remove Suffix
   * @return MenuItem
   */
  removeSuffix(): this {
    this.suffix = undefined;
    return this;
  }

  /**
   * has uri
   * @return boolean
   */
  hasUri(): boolean {
    return !!this.uri;
  }

  /**
   * Get uri
   * @return string, uri
   */
  getUri() {
    return this.uri;
  }

  /**
   * Set uri
   * @param uri - string
   * @return MenuItem
   */
  setUri(uri?: string): this {
    this.uri = uri;
    return this;
  }

  /**
   * Has query param
   * @param name - string
   * @return boolean
   */
  hasQueryParam(name: string): boolean {
    return name in this.queryParams;
  }

  /**
   * Get query params
   * @return Object
   */
  getQueryParams(): {} {
    return this.queryParams;
  }

  /**
   * Get query params
   * @param name - attribute name
   * @param defaultValue - any | null
   */
  getQueryParam(name: string, defaultValue?: null | string): null | any {
    if (this.hasQueryParam(name)) {
      return this.queryParams[name];
    }
    return defaultValue;
  }

  /**
   * Set query param
   * @param param - string
   * @param value - any
   * @return MenuItem
   */
  setQueryParam(param: string, value: any): this {
    this.queryParams[param] = value;
    return this;
  }

  /**
   * Set query param
   * @param params - object
   * @return MenuItem
   */
  setQueryParams(params: {}): this {
    this.queryParams = params;
    return this;
  }

  /**
   * has router link
   * @return boolean
   */
  hasRouterLink(): boolean {
    return Array.isArray(this.routerLink) && this.routerLink.length > 0;
  }

  /**
   * Get router link
   * @return []
   */
  getRouterLink() {
    return this.routerLink;
  }

  /**
   * Set router link
   * @param routerLink - array of string
   * @return MenuItem
   */
  setRouterLink(routerLink?: string[]): this {
    this.routerLink = routerLink;
    return this;
  }

  /**
   * Get Label
   * @return string, return label if defined or name
   */
  getLabel() {
    return this.label || this.getName();
  }

  /**
   * Set Label
   * @param label - string
   * @return string
   */
  setLabel(label?: string): this {
    this.label = label;
    return this;
  }

  /**
   * Has attribute
   * @param name - string
   * @return boolean
   */
  hasAttribute(name: string) {
    return name in this.attributes;
  }

  /**
   * Get attributes
   * @return dictionary of attributes
   */
  getAttributes() {
    return this.attributes;
  }

  /**
   * set attributes
   * @param attributes - dictionary of attributes
   * @return MenuItem
   */
  setAttributes(attributes: {}): this {
    this.attributes = attributes;
    return this;
  }

  /**
   * Get attribute
   * @param name - attribute name
   * @param defaultValue - string | null
   */
  getAttribute(name: string, defaultValue?: null | string): null | string {
    return (name in this.attributes)
      ? this.attributes[name]
      : defaultValue;
  }

  /**
   * Set Attribute
   * @param name - attribute name
   * @param value - value of attribute
   * @return MenuItem
   */
  setAttribute(name: string, value: string): this {
    this.attributes[name] = value;
    return this;
  }

  /**
   * Delete attribute
   * @param name - string, name of attribute
   * @return boolean
   */
  deleteAttribute(name: string): boolean {
    return this._deleteAttr(name, this.attributes);
  }

  /**
   * Add child
   * @param child - MenuItem or string
   * @param options - dictionary of options
   * @return MenuItem
   */
  addChild(child: MenuItemInterface | string, options?: {}): MenuItemInterface {
    if (typeof(child) === 'string') {
      child = this.factory.createItem(child, options);
    }
    child.setParent(this);
    this.children.push(child);
    return child;
  }

  /**
   * Get Children
   * @return array of children
   */
  getChildren(): Array<MenuItemInterface> {
    return this.children;
  }

  /**
   * Get child
   * @param name - string, name of child menu
   * @return MenuItem or null
   */
  getChild(name: string): MenuItemInterface {
    return (name in this.children)
      ? this.children[name]
      : null;
  }

  /**
   * Has children
   * @return boolean
   */
  hasChildren(): boolean {
    let hasChildren = false;
    this.children.forEach(() => {
      if (!hasChildren) {
        hasChildren = true;
      }
    });
    return hasChildren;
  }

  /**
   * Get Level
   * @return integer, level of menu
   */
  getLevel(): number {
    return this.parent ? this.parent.getLevel() + 1 : 0;
  }

  /**
   * Get parent
   * @return parent MenuItem
   */
  getParent(): MenuItemInterface {
    return this.parent;
  }

  /**
   * Set Parent
   * @param parent - MenuItem
   * @return MenuItem
   */
  setParent(parent: any): this {
    if (parent === this) {
      throw new Error('Item cannot be a child of itself');
    }
    this.parent = parent;
    return this;
  }

  /**
   * Has label attribute
   * @param name - string, name of label attribute
   * @return boolean
   */
  hasLabelAttribute(name: string): boolean {
    return name in this.labelAttributes;
  }

  /**
   * Get label attributes
   * @return dictionary of label attributes
   */
  getLabelAttributes(): {} {
    return this.labelAttributes;
  }

  /**
   * Set label attributes
   * @param labelAttributes - dictionary of label attributes
   * @return MenuItem
   */
  setLabelAttributes(labelAttributes: {}): this {
    this.labelAttributes = labelAttributes;
    return this;
  }

  /**
   * Get label attribute
   * @param name - string, name of label attribute
   * @param defaultValue - string
   * @return string | null, label attribute or default value
   */
  getLabelAttribute(name: string, defaultValue?: null | string): null | string {
    if (this.hasLabelAttribute(name)) {
      return this.labelAttributes[name];
    }
    return defaultValue;
  }

  /**
   * Set label attribute
   * @param name - string, name of label attribute
   * @param value - string, value of label attribute
   * @return MenuItem
   */
  setLabelAttribute(name: string, value: string): this {
    this.labelAttributes[name] = value;
    return this;
  }

  /**
   * Delete label attribute
   * @param name - string, name of attribute
   * @return boolean
   */
  deleteLabelAttribute(name: string): boolean {
    return this._deleteAttr(name, this.labelAttributes);
  }

  /**
   * Has extra
   * @param name - string, name of extra attribute
   * @return boolean
   */
  hasExtra(name: string): boolean {
    return name in this.extras;
  }

  /**
   * Get extras
   * @return dictionary of extra attributes
   */
  getExtras(): {} {
    return this.extras;
  }

  /**
   * Set extras
   * @param extras - dictionary of extra attributes
   * @return MenuItem
   */
  setExtras(extras: {}): this {
    this.extras = extras;
    return this;
  }

  /**
   * Get extra
   * @param name - string, name of extra attribute
   * @param defaultValue - string | null
   * @return string | null, value of extra attribute or default value
   */
  getExtra(name: string, defaultValue?: null | string): null | string {
    if (this.hasExtra(name)) {
      return this.extras[name];
    }
    return defaultValue;
  }

  /**
   * Set Extra
   * @param name - string, name of extra attribute
   * @param value - string, value of extra attribute
   * @return MenuItem
   */
  setExtra(name: string, value: string): this {
    if (!(this.hasExtra(name))) {
      this.extras[name] = value;
    }
    return this;
  }

  /**
   * Delete extra attribute
   * @param name - string, name of attribute
   * @return boolean
   */
  deleteExtraAttribute(name: string): boolean {
    return this._deleteAttr(name, this.extras);
  }

  /**
   * Is active
   * @return boolean
   */
  isActive() {
    return this.active;
  }

  /**
   * Set active
   * @param active - boolean
   */
  setActive(active: boolean) {
    this.active = active;
    return this;
  }

  /**
   * Is the menuItem is enabled
   * @return boolean
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * enable the menuItem
   * @return MenuItem
   */
  enable(): this {
    this.enabled = true;
    return this;
  }

  /**
   * enable the menuItem
   * @return MenuItem
   */
  disable(): this {
    this.enabled = false;
    return this;
  }


  /**
   * Count
   * @return integer, number of children
   */
  count(): number {
    return this.children.length;
  }

  /**
   * Delete
   * @param name - string, name of attribute
   * @param attributes - dictionary of attributes
   * @return boolean
   */
  private _deleteAttr(name: string, attributes: {}): boolean {
    if (name in attributes) {
      return delete attributes[name];
    }
    return false;
  }

  /**
   * Set Prefix Suffix
   * @param name - string
   * @param htmlClasses - null or string
   * @return Object with name and class attributes
   */
  private _setPrefixSuffix(name: string, htmlClasses: null | string) {
    return {
      name,
      class: htmlClasses
    };
  }
}
