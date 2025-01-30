/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { CallbackArrayFilterPipe } from './callback-array-filter.pipe';

describe('CallbackArrayFilterPipe', () => {
  const pipe = new CallbackArrayFilterPipe();

  it('Should return an empty array if there are no items', () => {
    expect(pipe.transform()).toEqual([]);
  });

  it('Should return the original array if the callback function is not defined', () => {
    const items = [{ title: 'foo', value: 'foo'}];
    expect(pipe.transform(items)).toEqual(items);
  });

  it('Should return a filtered array', () => {
    const items = [
      { title: 'foo', value: 'foo'},
      { title: 'bar', value: 'bar'}
    ];
    const callback = ((item: any) => item.value === 'bar');
    expect(pipe.transform(items, callback)).toEqual([{ title: 'bar', value: 'bar'}]);
  });
});
