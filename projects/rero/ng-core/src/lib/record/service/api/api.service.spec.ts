// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { CoreConfigService } from '../../../core/service/core-config/core-config.service';

describe('ApiService', () => {
  let apiService: ApiService;
  let coreConfigService: CoreConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, CoreConfigService],
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
