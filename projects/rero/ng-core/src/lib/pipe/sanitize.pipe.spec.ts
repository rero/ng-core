/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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
import { TestBed } from '@angular/core/testing';
import { SanitizePipe } from './sanitize.pipe';

describe('SanitizePipe', () => {
  let pipe: SanitizePipe;

  beforeEach(() => {
    TestBed
      .configureTestingModule({
        providers: [
          SanitizePipe
        ]
      });
    pipe = TestBed.inject(SanitizePipe);
  });

  it('should return a string without html content', () => {
    expect(pipe.transform('<b>maison</b> neuve')).toEqual('maison neuve');
  });

  it('should return a string with the tag change', () => {
    expect(pipe.transform('<b>maison</b> neuve', '<b>(.*)</b>', '<em>$1</em>')).toEqual('<em>maison</em> neuve');
  });
});
