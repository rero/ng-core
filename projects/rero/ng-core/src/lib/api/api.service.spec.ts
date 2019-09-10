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
import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import { CONFIG } from '../core.config';

let apiService: ApiService;

describe('ApiService', () => {
  beforeEach(() => {
    const config = {
      apiEndpointPrefix: '/api',
      apiBaseUrl: 'https://localhost:5000'
    };

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        { provide: CONFIG, useValue: config }
      ]
    })

    apiService = TestBed.get(ApiService);
  });

  it('should be created', () => {
    const service: ApiService = TestBed.get(ApiService);
    expect(service).toBeTruthy();
  });

  it('#getEndpointByType should return endpoint /api/documents', () => {
    expect(apiService.getEndpointByType('documents'))
      .toBe('/api/documents')
  });

  it('#getEndpointByType should return endpoint with absolute URL', () => {
    expect(apiService.getEndpointByType('documents', true))
      .toBe('https://localhost:5000/api/documents')
  });
});
