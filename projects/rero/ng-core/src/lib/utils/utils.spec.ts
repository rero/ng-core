/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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

import { extractIdOnRef } from './utils';
import { TestBed } from '@angular/core/testing';

describe('Utils', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should evaluate /5 to 5', () => {

    const ref = 'ils.rero.ch/api/documents/5';
    expect(extractIdOnRef(ref)).toEqual('5');

  });

  it('should evaluate /28 to 28', () => {

    const ref = 'ils.rero.ch/api/documents/28';
    expect(extractIdOnRef(ref)).toEqual('28');

  });

  it('should evaluate /286 to 286', () => {

    const ref = 'ils.rero.ch/api/documents/286';
    expect(extractIdOnRef(ref)).toEqual('286');

  });

  it('should evaluate /9999 to 9999', () => {

    const ref = 'ils.rero.ch/api/documents/9999';
    expect(extractIdOnRef(ref)).toEqual('9999');

  });

  it('should evaluate /19999 to 19999', () => {

    const ref = 'ils.rero.ch/api/documents/19999';
    expect(extractIdOnRef(ref)).toEqual('19999');

  });

});
