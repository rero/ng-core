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
import { TestBed } from '@angular/core/testing';
import { CryptoJsService } from './crypto-js.service';

describe('CryptoJsService', () => {

  let service: CryptoJsService;

  beforeEach(() => {
    TestBed.configureTestingModule({}),
    service = TestBed.inject(CryptoJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should encrypt and decrypt data', () => {
    const data = 'The weather is good';
    const encrypted = service.encrypt(data);
    expect(service.decrypt(encrypted)).toEqual(data);
  });
});
