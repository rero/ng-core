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
import { CoreExtension } from './core-extension';
import { OptionsInterface } from './options-interface';
import { MenuFactory } from '../menu-factory';
import { MenuItem } from '../menu-item';

describe('CoreExtension', () => {

  let coreExtension: CoreExtension;

  beforeEach(() => {
    coreExtension = new CoreExtension();
  });

  it('should create an instance', () => {
    expect(coreExtension).toBeTruthy();
  });

  it('Default build options', () => {
    const buildOptions: OptionsInterface = coreExtension.buildOptions({});
    expect(buildOptions.hasOwnProperty('label')).toBeTruthy();
  });

  it('Added label on build options', () => {
    const options = {
      label: 'menu-label'
    };
    const buildOptions = coreExtension.buildOptions(options);
    expect(buildOptions.label).toEqual('menu-label');
  });

  it('build item', () => {
    const options = {
      uri: 'http://www.test.com'
    };
    const buildOptions = coreExtension.buildOptions(options);
    const menuItem = new MenuItem('test', new MenuFactory());
    coreExtension.buildItem(menuItem, buildOptions);
    expect(menuItem.getUri()).toEqual('http://www.test.com');
  });
});
