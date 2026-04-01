/*
 * RERO angular core
 * Copyright (C) 2022 RERO
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
import { BucketNamePipe } from './bucket-name.pipe';

describe('BucketNamePipe', () => {
  let pipe: BucketNamePipe;

  beforeEach(() => {
    pipe = new BucketNamePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the default value', () => {
    expect(pipe.transform('book', 'document_type')).toEqual('book');
  });

  it('should return the modified value for the language', () => {
    expect(pipe.transform('fre', 'language')).toEqual('lang_fre');
  });
});
