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
import { MenuItem } from './menu-item';
import { MenuFactory } from './menu-factory';

describe('MenuItem', () => {

  let menuItem: MenuItem;

  beforeEach(() => {
    menuItem = new MenuItem('test');
  });

  it('should create an instance', () => {
    expect(menuItem).toBeTruthy();
  });

  it('item has no factory', () => {
    expect(menuItem.hasFactory()).toBeFalsy();
  });

  it('item has factory', () => {
    menuItem.setFactory(new MenuFactory());
    expect(menuItem.hasFactory()).toBeTruthy();
  });

  it('should have a default name value', () => {
    expect(menuItem.getName()).toEqual('test');
  });

  it('item name update', () => {
    menuItem.setName('menu');
    expect(menuItem.getName()).toEqual('menu');
  });

  it('should not have uri', () => {
    menuItem.setName('menu');
    expect(menuItem.hasUri()).toBeFalsy();
  });

  it('should have prefix', () => {
    menuItem.setPrefix('menu-prefix');
    expect(menuItem.getPrefix()).toEqual(
      { name: 'menu-prefix', class: undefined }
    );
  });

  it('should have suffix', () => {
    menuItem.setSuffix('menu-prefix', 'foo');
    expect(menuItem.getSuffix()).toEqual(
      { name: 'menu-prefix', class: 'foo' }
    );
  });

  it('should have uri', () => {
    const uri = 'http://myUri.com';
    menuItem.setUri(uri);
    expect(menuItem.hasUri()).toBeTruthy();
    expect(menuItem.getUri()).toEqual(uri);
  });

  it('should have query params', () => {
    const queryParams = {q: 'anatomic', page: 1};
    menuItem.setQueryParams(queryParams);
    expect(menuItem.hasQueryParam('q')).toBeTruthy();
    expect(menuItem.hasQueryParam('foo')).toBeFalsy();
    expect(menuItem.getQueryParams()).toEqual(queryParams);
    expect(menuItem.getQueryParam('q')).toEqual('anatomic');
    menuItem.setQueryParam('size', 10);
    expect(menuItem.getQueryParam('size')).toEqual(10);
  });

  it('should have router link', () => {
    const routerLink = ['/foo', 'bar'];
    expect(menuItem.hasRouterLink()).toBeFalsy();
    menuItem.setRouterLink(routerLink);
    expect(menuItem.hasRouterLink()).toBeTruthy();
    expect(menuItem.getRouterLink()).toEqual(routerLink);
  });

  it('should have a default label value', () => {
    expect(menuItem.getLabel()).toEqual('test');
  });

  it('should have a label value', () => {
    menuItem.setLabel('my-label');
    expect(menuItem.getLabel()).toEqual('my-label');
  });

  it('should have a empty array of attributes', () => {
    expect(menuItem.getAttributes()).toEqual({});
  });

  it('should have a array of attributes', () => {
    menuItem.setAttributes({id: 'foo', 'data-attr': 'bar'});
    expect(menuItem.getAttributes()).toEqual({id: 'foo', 'data-attr': 'bar'});
  });

  it('should have a attribute of array', () => {
    menuItem.setAttributes({id: 'foo', 'data-attr': 'bar'});
    expect(menuItem.hasAttribute('id')).toBeTruthy();
  });

  it('should have a attribute of array', () => {
    menuItem.setAttribute('id', 'test');
    expect(menuItem.hasAttribute('id')).toBeTruthy();
    expect(menuItem.hasAttribute('foo')).toBeFalsy();
    expect(menuItem.getAttribute('id')).toEqual('test');
  });

  it('should have a default attribute value if not defined', () => {
    expect(menuItem.getAttribute('id', 'foo')).toEqual('foo');
  });

  it('should deleted a attribute', () => {
    menuItem.setAttribute('foo', 'bar');
    expect(menuItem.deleteAttribute('foo')).toBeTruthy();
    expect(menuItem.deleteAttribute('foo')).toBeFalsy();
  });

  it('should not have children', () => {
    expect(menuItem.hasChildren()).toBeFalsy();
  });

  it('should have children', () => {
    menuItem.setFactory(new MenuFactory());
    menuItem.addChild('submenu');
    expect(menuItem.hasChildren()).toBeTruthy();
    expect(menuItem.getChild('submenu') instanceof MenuItem);
    expect(menuItem.getChild('foo')).toBeNull();
    expect(menuItem.count()).toEqual(1);
  });

  it('should have a level 0', () => {
    expect(menuItem.getLevel()).toEqual(0);
  });

  it('should have a level 1', () => {
    menuItem.setParent(new MenuItem('parent'));
    expect(menuItem.getLevel()).toEqual(1);
  });

  it('should have a label attributes', () => {
    const attr = {foo: 'bar', bar: 'foo'};
    menuItem.setLabelAttributes(attr);
    expect(menuItem.getLabelAttributes()).toEqual(attr);
  });

  it('should have a label attribute', () => {
    menuItem.setLabelAttribute('foo', 'bar');
    expect(menuItem.hasLabelAttribute('foo')).toBeTruthy();
    expect(menuItem.hasLabelAttribute('bar')).toBeFalsy();
    expect(menuItem.getLabelAttribute('foo')).toEqual('bar');
  });


  it('should have a default label attribute value if not defined', () => {
    expect(menuItem.getLabelAttribute('id', 'foo')).toEqual('foo');
  });

  it('should deleted a label attribute', () => {
    menuItem.setLabelAttribute('foo', 'bar');
    expect(menuItem.deleteLabelAttribute('foo')).toBeTruthy();
    expect(menuItem.deleteLabelAttribute('foo')).toBeFalsy();
  });

  it('should have a extra attributes', () => {
    const attr = {foo: 'bar', bar: 'foo'};
    menuItem.setExtras(attr);
    expect(menuItem.getExtras()).toEqual(attr);
  });

  it('should have a extra attribute', () => {
    menuItem.setExtra('foo', 'bar');
    expect(menuItem.hasExtra('foo')).toBeTruthy();
    expect(menuItem.hasExtra('bar')).toBeFalsy();
    expect(menuItem.getExtra('foo')).toEqual('bar');
  });

  it('should deleted a extra attribute', () => {
    menuItem.setExtra('foo', 'bar');
    expect(menuItem.deleteExtraAttribute('foo')).toBeTruthy();
    expect(menuItem.deleteExtraAttribute('foo')).toBeFalsy();
  });

  it('should have a default extra attribute value if not defined', () => {
    expect(menuItem.getExtra('id', 'foo')).toEqual('foo');
  });

  it('should have a extra attribute', () => {
    expect(menuItem.isActive()).toBeFalsy();
    menuItem.setActive(true);
    expect(menuItem.isActive()).toBeTruthy();
  });
});
