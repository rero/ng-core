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
import { SortByKeysPipe } from './sort-by-keys.pipe';

describe('SortByKey.PipePipe', () => {
  const pipe = new SortByKeysPipe();
  const sortValues = [
    { label: 'House', value: 'h' },
    { label: 'Vehicule', value: 'a' },
    { label: 'Moto', value: 'z' }
  ];
  const sortByLabel = [
    { label: 'House', value: 'h' },
    { label: 'Moto', value: 'z' },
    { label: 'Vehicule', value: 'a' }
  ];
  const sortByLabelDesc = [
    { label: 'Vehicule', value: 'a' },
    { label: 'Moto', value: 'z' },
    { label: 'House', value: 'h' }
  ];
  const sortByKey = [
    { label: 'Vehicule', value: 'a' },
    { label: 'House', value: 'h' },
    { label: 'Moto', value: 'z' }
  ];

  it('order with label', () => {
    expect(pipe.transform(sortValues, 'label')).toEqual(sortByLabel);
  });

  it('order with value', () => {
    expect(pipe.transform(sortValues, 'value')).toEqual(sortByKey);
  });

  it('order with label desc', () => {
    expect(pipe.transform(sortValues, '-label')).toEqual(sortByLabelDesc);
  });
});
