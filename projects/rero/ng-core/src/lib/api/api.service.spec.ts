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
import { TestBed } from '@angular/core/testing';
import { CoreConfigService } from '../core-config.service';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let apiService: ApiService;
  let coreConfigService: CoreConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        CoreConfigService
      ]
    });
    apiService = TestBed.inject(ApiService);
    coreConfigService = TestBed.inject(CoreConfigService);
    coreConfigService.apiEndpointPrefix = '/api';
    coreConfigService.apiBaseUrl = 'https://localhost:5000';
  });

  it('should be created', () => {
    const service: ApiService = TestBed.inject(ApiService);
    expect(service).toBeTruthy();
  });

  it('#getEndpointByType should return endpoint /api/documents', () => {
    expect(apiService.getEndpointByType('documents')).toBe('/api/documents');
  });

  it('#getEndpointByType should return endpoint with absolute URL', () => {
    expect(apiService.getEndpointByType('documents', true)).toBe('https://localhost:5000/api/documents');
  });

  it('#getExportEndpointByType should return endpoint /api/documents', () => {
    expect(apiService.getExportEndpointByType('documents')).toBe('/api/export/documents');
  });

  it('#getExportEndpointByType should return endpoint with absolute URL', () => {
    expect(apiService.getExportEndpointByType('documents', true)).toBe('https://localhost:5000/api/export/documents');
  });

  it('getRefEndpoint should return endpoint with ou without prefix', () => {
    expect(apiService.getRefEndpoint('documents', '1')).toBe('/api/documents/1');
    coreConfigService.$refPrefix = '/elements';
    expect(apiService.getRefEndpoint('documents', '1')).toBe('/elements/api/documents/1');
  });

  it('getSchemaFormEndpoint should return endpoint for schema', () => {
    expect(apiService.getSchemaFormEndpoint('documents')).toBe('/api/schemaform/documents');
    expect(apiService.getSchemaFormEndpoint('documents', true)).toBe('https://localhost:5000/api/schemaform/documents');
  });
});
