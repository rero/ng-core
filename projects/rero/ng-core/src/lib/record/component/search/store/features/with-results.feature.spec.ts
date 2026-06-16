// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import { withResults } from './with-results.feature';
import { EsResult } from '../../../../../model';
import { RecordService } from '../../../../service/record/record.service';

describe('withResults', () => {
  const TestStore = signalStore(withState({ currentType: '' }), withResults());

  let store: InstanceType<typeof TestStore>;
  let mockRecordService: any;

  beforeEach(() => {
    mockRecordService = {
      getRecords: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [TestStore, { provide: RecordService, useValue: mockRecordService }],
    });
    store = TestBed.inject(TestStore);
  });

  it('should initialize with default values', () => {
    expect(store.esResult()).toBeNull();
    expect(store.total()).toBe(0);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should compute hits from esResult', () => {
    expect(store.hits()).toEqual([]);
  });

  it('should compute hasRecords correctly', () => {
    expect(store.hasRecords()).toBe(false);

    const mockResult: EsResult = {
      hits: {
        hits: [{ id: '1', metadata: {}, created: '', updated: '', links: { self: '' } }],
        total: { value: 1, relation: 'eq' },
      },
      aggregations: {},
      links: { self: '' },
    };
    store.setResults(mockResult);
    expect(store.hasRecords()).toBe(true);
  });

  it('should compute isEmpty correctly', () => {
    expect(store.isEmpty()).toBe(true);

    const mockResult: EsResult = {
      hits: {
        hits: [{ id: '1', metadata: {}, created: '', updated: '', links: { self: '' } }],
        total: { value: 1, relation: 'eq' },
      },
      aggregations: {},
      links: { self: '' },
    };
    store.setResults(mockResult);
    expect(store.isEmpty()).toBe(false);
  });

  it('should set results and update state', () => {
    const mockResult: EsResult = {
      hits: {
        hits: [
          { id: '1', metadata: { title: 'Record 1' }, created: '', updated: '', links: { self: '' } },
          { id: '2', metadata: { title: 'Record 2' }, created: '', updated: '', links: { self: '' } },
        ],
        total: { value: 2, relation: 'eq' },
      },
      aggregations: {},
      links: { self: '' },
    };

    store.setResults(mockResult);

    expect(store.esResult()).toEqual(mockResult);
    expect(store.total()).toBe(2);
    expect(store.hits()).toEqual(mockResult.hits.hits);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set loading state', () => {
    store.setLoading(true);
    expect(store.isLoading()).toBe(true);

    store.setLoading(false);
    expect(store.isLoading()).toBe(false);
  });

  it('should set error and stop loading', () => {
    store.setLoading(true);

    const mockError = { status: 500, title: 'Search failed', message: 'Server error' };
    store.setError(mockError);

    expect(store.error()).toEqual(mockError);
    expect(store.isLoading()).toBe(false);
  });

  it('should clear results', () => {
    // Set some data first
    const mockResult: EsResult = {
      hits: {
        hits: [{ id: '1', metadata: {}, created: '', updated: '', links: { self: '' } }],
        total: { value: 1, relation: 'eq' },
      },
      aggregations: {},
      links: { self: '' },
    };
    store.setResults(mockResult);
    store.setError({ status: 500, title: 'Error' });

    // Clear
    store.clearResults();

    expect(store.esResult()).toBeNull();
    expect(store.total()).toBe(0);
    expect(store.error()).toBeNull();
  });

  it('should handle null esResult', () => {
    expect(store.hits()).toEqual([]);
  });

  it('should clear error when setting results', () => {
    store.setError({ status: 500, title: 'Error' });
    expect(store.error()).toBeTruthy();

    const mockResult: EsResult = {
      hits: { hits: [], total: { value: 0, relation: 'eq' } },
      aggregations: {},
      links: { self: '' },
    };
    store.setResults(mockResult);
    expect(store.error()).toBeNull();
  });
});
