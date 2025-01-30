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
import { FilesizePipe } from './filesize.pipe';

describe('FilesizePipe', () => {
  const pipe = new FilesizePipe();

  it('Should return the value according to the unit', () => {
    const sizes = {
      1000:  '0.98 kB',
      1500000: '1.43 MB',
      1500000000: '1.40 GB',
      1500000000000: '1.36 TB',
      1500000000000000: '1.33 PB',
      1500000000000000000: '1.30 EB',
      1500000000000000000000: '1.27 ZB',
      1500000000000000000000000: '1.24 YB'
    };

    Object.keys(sizes).forEach(key => {
      expect(pipe.transform(Number(key))).toEqual(sizes[key]);
    });
  });

  it('Should return the value with the precision', () => {
    expect(pipe.transform(1500000, 4)).toEqual('1.4305 MB');
  });
});
