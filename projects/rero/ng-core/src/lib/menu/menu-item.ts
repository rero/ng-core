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
import { isArray } from 'util';
import { MenuItemInterface } from './menu-item-interface';
import { MenuFactoryInterface } from './menu-factory-interface';

export class MenuItem implements MenuItemInterface {

  /** Menu name */
  private _name: string;

  /** Prefix */
  private _prefix: {
    name: string,
    class: string
  };

  /** Suffix */
  private _suffix: {
    name: string,
    class: string
  };

  /** Factory */
  private _factory: MenuFactoryInterface;

  /** Parent menuItem */
  private _parent?: MenuItemInterface;

  /** Children of menuItem */
  private _children = [];

  /** Uri */
  private _uri?: string;

  /** Angular router link */
  private _routerLink: string[];

  /** Label of menu */
  private _label?: string;

  /** Attributes */
  private _attributes = {};

  /** Label attributes */
  private _labelAttributes = {};

  /** Extra attributes */
  private _extras = {};

  /** Active menu */
  private _active = false;

  /**
   * Constructor
   * @param name - string
   * @param factory - MenuFactoryInterface or null
   */
  constructor(name: string, factory?: MenuFactoryInterface) {
    this._name = name;
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
    this._factory = factory;
    return this;
  }

  /**
   * has factory
   * @return boolean
   */
  hasFactory() {
    return this._factory ? true : false;
  }

  /**
   * Get name
   * @return string, name of menu
   */
  getName() {
    return this._name;
  }

  /**
   * Set name
   * @param name - string, set name of menu
   * @return MenuItem
   */
  setName(name: string): this {
    if (this._name === name) {
      return this;
    }
    this._name = name;
    return this;
  }

  /**
   * Get Prefix
   * @return Object with name and class properties
   */
  getPrefix() {
    return this._prefix;
  }

  /**
   * Set Prefix
   * @param name - string
   * @param htmlClasses - string
   * @return MenuItem
   */
  setPrefix(name: string, htmlClasses?: string): this {
    this._prefix = this._setPrefixSuffix(name, htmlClasses);
    return this;
  }

  /**
   * Remove Prefix
   * @return MenuItem
   */
  removePrefix(): this {
    this._prefix = undefined;
    return this;
  }

  /**
   * Get Suffix
   * @return Object with name and class properties
   */
  getSuffix() {
    return this._suffix;
  }

  /**
   * Set Suffix
   * @param name - string
   * @param htmlClasses - string
   * @return MenuItem
   */
  setSuffix(name: string, htmlClasses?: string): this {
    this._suffix = this._setPrefixSuffix(name, htmlClasses);
    return this;
  }

  /**
   * Remove Suffix
   * @return MenuItem
   */
  removeSuffix(): this {
    this._suffix = undefined;
    return this;
  }

  /**
   * has uri
   * @return boolean
   */
  hasUri(): boolean {
    return this._uri ? true : false;
  }

  /**
   * Get uri
   * @return string, uri
   */
  getUri() {
    return this._uri;
  }

  /**
   * Set uri
   * @param uri - string
   * @return MenuItem
   */
  setUri(uri?: string): this {
    this._uri = uri;
    return this;
  }

  /**
   * has router link
   * @return boolean
   */
  hasRouterLink(): boolean {
    return Array.isArray(this._routerLink) && this._routerLink.length > 0;
  }

  /**
   * Get router link
   * @return []
   */
  getRouterLink() {
    return this._routerLink;
  }

  /**
   * Set router link
   * @param routerLink - array of string
   * @return MenuItem
   */
  setRouterLink(routerLink?: string[]): this {
    this._routerLink = routerLink;
    return this;
  }

  /**
   * Get Label
   * @return string, return label if defined or name
   */
  getLabel() {
    return this._label ? this._label : this.getName();
  }

  /**
   * Set Label
   * @param label - string
   * @return string
   */
  setLabel(label?: string): this {
    this._label = label;
    return this;
  }

  /**
   * Has attribute
   * @param name - string
   * @return boolean
   */
  hasAttribute(name: string) {
    return this.has(name, this._attributes);
  }

  /**
   * Get attributes
   * @return dictionnary of attributes
   */
  getAttributes() {
    return this._attributes;
  }

  /**
   * set attributes
   * @param attributes - dictionnary of attributes
   * @return MenuItem
   */
  setAttributes(attributes: {}): this {
    this._attributes = attributes;
    return this;
  }

  /**
   * Get attribute
   * @param name - attribute name
   * @param defaultValue - string | null
   */
  getAttribute(name: string, defaultValue?: null | string): null | string {
    if (this.hasAttribute(name)) {
      return this._attributes[name];
    }
    return defaultValue;
  }

  /**
   * Set Attribute
   * @param name - attribute name
   * @param value - value of attribute
   * @return MenuItem
   */
  setAttribute(name: string, value: string): this {
    this._attributes[name] = value;
    return this;
  }

  /**
   * Delete attribute
   * @param name - string, name of attribute
   * @return boolean
   */
  deleteAttribute(name: string): boolean {
    return this._deleteAttr(name, this._attributes);
  }

  /**
   * Add child
   * @param child - MenuItem or string
   * @param options - dictionnary of options
   * @return MenuItem
   */
  addChild(child: MenuItemInterface | string, options?: {}): MenuItemInterface {
    if (typeof(child) === 'string') {
      child = this._factory.createItem(child, options);
    }
    child.setParent(this);
    this._children.push(child);
    return child;
  }

  /**
   * Get Children
   * @return array of children
   */
  getChildren() {
    return this._children;
  }

  /**
   * Get child
   * @param name - string, name of child menu
   * @return MenuItem or null
   */
  getChild(name: string): MenuItemInterface {
    return this.has(name, this._children)
      ? this._children[name]
      : null;
  }

  /**
   * Has children
   * @return boolean
   */
  hasChildren(): boolean {
    let hasChildren = false;
    this._children.forEach(() => {
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
    return this._parent ? this._parent.getLevel() + 1 : 0;
  }

  /**
   * Get parent
   * @return parent MenuItem
   */
  getParent(): MenuItemInterface {
    return this._parent;
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
    this._parent = parent;
    return this;
  }

  /**
   * Has label attribute
   * @param name - string, name of label attribute
   * @return boolean
   */
  hasLabelAttribute(name: string) {
    return this.has(name, this._labelAttributes);
  }

  /**
   * Get label attributes
   * @return dictionnary of label attributes
   */
  getLabelAttributes(): {} {
    return this._labelAttributes;
  }

  /**
   * Set label attributes
   * @param labelAttributes - dictionnary of label attributes
   * @return MenuItem
   */
  setLabelAttributes(labelAttributes: {}): this {
    this._labelAttributes = labelAttributes;
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
      return this._labelAttributes[name];
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
    this._labelAttributes[name] = value;
    return this;
  }

  /**
   * Delete label attribute
   * @param name - string, name of attribute
   * @return boolean
   */
  deleteLabelAttribute(name: string): boolean {
    return this._deleteAttr(name, this._labelAttributes);
  }

  /**
   * Has extra
   * @param name - string, name of extra attribute
   * @return boolean
   */
  hasExtra(name: string): boolean {
    return this.has(name, this._extras);
  }

  /**
   * Get extras
   * @return dictionnary of extra attributes
   */
  getExtras(): {} {
    return this._extras;
  }

  /**
   * Set extras
   * @param extras - dictionnary of extra attributes
   * @return MenuItem
   */
  setExtras(extras: {}): this {
    this._extras = extras;
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
      return this._extras[name];
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
      this._extras[name] = value;
    }
    return this;
  }

  /**
   * Delete extra attribute
   * @param name - string, name of attribute
   * @return boolean
   */
  deleteExtraAttribute(name: string): boolean {
    return this._deleteAttr(name, this._extras);
  }

  /**
   * Is active
   * @return boolean
   */
  isActive() {
    return this._active;
  }

  /**
   * Set active
   * @param active - boolean
   */
  setActive(active: boolean) {
    this._active = active;
    return this;
  }

  /**
   * Count
   * @return integer, number of children
   */
  count(): number {
    return this._children.length;
  }

  /**
   * has parameter in dictionnary
   * @param name - string, attribute propriety name
   * @param dict - dictionnary of attributes
   * @return boolean
   */
  private has(name: string, dict = {}): boolean {
    return Object.keys(dict).find(element => element === name)
      ? true
      : false;
  }

  /**
   * Delete
   * @param name - string, name of attribute
   * @param attributes - dictionnary of attributes
   * @return boolean
   */
  private _deleteAttr(name: string, attributes: {}): boolean {
    if (this.has(name, attributes)) {
      delete attributes[name];
      return true;
    }
    return false;
  }

  /**
   * Set Prefix Suffix
   * @param name - string
   * @param htmlClasses - null or string
   * @return Object with name and class attributes
   */
  _setPrefixSuffix(name: string, htmlClasses: null | string) {
    return {
      name,
      class: htmlClasses
    };
  }
}
