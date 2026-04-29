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

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { Aggregation, EsResult } from '../../../../model';
import { RecordService } from '../../../service/record/record.service';
import { FetchRecordsParams } from './features/with-results.feature';
import { RecordSearchStore } from './record-search.store';

describe('RecordSearchStore', () => {
  let store: InstanceType<typeof RecordSearchStore>;
  let mockRecordService: any;
  let mockTranslateService: any;

  const mockEsResult: EsResult = {
    hits: {
      hits: [
        { id: '1', metadata: { title: 'Test Doc' }, created: '', updated: '', links: { self: '' } },
        { id: '2', metadata: { title: 'Another Doc' }, created: '', updated: '', links: { self: '' } },
      ],
      total: { value: 2, relation: 'eq' },
    },
    aggregations: {},
    links: { self: '' },
  };

  /** Build FetchRecordsParams from current store state */
  function buildFetchParams(): FetchRecordsParams {
    return {
      index: store.currentIndex(),
      query: store.queryString(),
      page: store.page(),
      itemsPerPage: store.size(),
      allowEmptySearch: store.config()?.allowEmptySearch ?? false,
      aggregationsFilters: store.aggregationsFilters(),
      preFilters: store.config().preFilters,
      sort: store.sort(),
      facets: store.facetsParameter(),
      headers: store.config()?.listHeaders ?? undefined,
    };
  }

  beforeEach(() => {
    mockRecordService = {
      getRecords: vi.fn(),
    };
    mockRecordService.getRecords.mockReturnValue(of(mockEsResult));

    mockTranslateService = {
      instant: vi.fn(),
      stream: vi.fn(),
    };
    mockTranslateService.instant.mockReturnValue('Translated');
    mockTranslateService.stream.mockReturnValue(of('2 results'));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        RecordSearchStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RecordService, useValue: mockRecordService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
    store = TestBed.inject(RecordSearchStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('search query feature', () => {
    beforeEach(() => {
      // Setup configs for testing
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents' } as any, { key: 'persons', label: 'Persons' } as any],
      });
      // Initialize currentType after config is set
      store.updateCurrentType('documents');
    });

    it('should have default query state', () => {
      expect(store.q()).toBe('');
      expect(store.currentType()).toBe('documents');
    });

    it('should update query', () => {
      store.updateQuery('test');
      expect(store.q()).toBe('test');
    });

    it('should update type', () => {
      store.updateCurrentType('persons');
      expect(store.currentType()).toBe('persons');
    });
  });

  describe('results feature', () => {
    it('should have default results state', () => {
      expect(store.total()).toBe(0);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.hits()).toEqual([]);
    });

    it('should set results', () => {
      const mockResult: EsResult = {
        hits: {
          hits: [
            { id: '1', metadata: {}, created: '', updated: '', links: { self: '' } },
            { id: '2', metadata: {}, created: '', updated: '', links: { self: '' } },
          ],
          total: { value: 2, relation: 'eq' },
        },
        aggregations: {},
        links: { self: '' },
      };

      store.setResults(mockResult);

      expect(store.total()).toBe(2);
      expect(store.hits()).toEqual(mockResult.hits.hits);
      expect(store.hasRecords()).toBe(true);
      expect(store.isEmpty()).toBe(false);
    });

    it('should manage loading state', () => {
      store.setLoading(true);
      expect(store.isLoading()).toBe(true);

      store.setLoading(false);
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('feature composition', () => {
    it('should have all features working together', () => {
      // Update query
      store.updateQuery('angular');
      store.updateCurrentType('documents');

      // Set loading
      store.setLoading(true);
      expect(store.isLoading()).toBe(true);

      // Set results
      const mockResult: EsResult = {
        hits: {
          hits: [{ id: '1', metadata: { title: 'Angular Guide' }, created: '', updated: '', links: { self: '' } }],
          total: { value: 1, relation: 'eq' },
        },
        aggregations: {},
        links: { self: '' },
      };
      store.setResults(mockResult);

      // Verify all state
      expect(store.q()).toBe('angular');
      expect(store.currentType()).toBe('documents');
      expect(store.total()).toBe(1);
      expect(store.isLoading()).toBe(false);
      expect(store.hits().length).toBe(1);
    });
  });

  describe('computed properties', () => {
    beforeEach(() => {
      // Setup a basic config
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            index: 'documents-index',
            sortOptions: [
              { label: 'Best match', value: 'bestmatch', defaultQuery: true, defaultNoQuery: false, icon: '' },
              { label: 'Newest', value: '-created', defaultNoQuery: true, defaultQuery: false, icon: '' },
            ],
          } as any,
          {
            key: 'persons',
            label: 'Persons',
            index: 'persons-index',
            sortOptions: [],
          } as any,
        ],
      });
      store.updateCurrentType('documents');
    });

    it('should compute config for current type', () => {
      const config = store.config();
      expect(config).toBeDefined();
      expect(config.key).toBe('documents');
      expect(config.label).toBe('Documents');
    });

    it('should compute currentIndex from config', () => {
      const index = store.currentIndex();
      expect(index).toBe('documents-index');
    });

    it('should fallback to key when index is not specified', () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'books',
            label: 'Books',
            index: '',
            sortOptions: [],
          } as any,
        ],
      });
      store.updateCurrentType('books');
      expect(store.currentIndex()).toBe('books');
    });

    it('should compute resultsText with translation', async () => {
      store.setResults(mockEsResult);

      await new Promise((resolve) => setTimeout(resolve, 100));
      const resultsText = store.resultsText();
      expect(resultsText).toBeDefined();
    });

    it('should compute queryString from q and selected fields', () => {
      store.updateQuery('test search');
      const queryString = store.queryString();
      expect(queryString).toBe('test search');
    });
  });

  describe('rxMethod fetchRecords', () => {
    beforeEach(() => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            index: 'documents-index',
            preFilters: { status: 'published' },
            listHeaders: { 'X-Custom': 'value' },
            sortOptions: [],
          } as any,
        ],
      });
      store.updateCurrentType('documents');
    });

    it('should call RecordService with correct parameters', async () => {
      store.updateQuery('test');
      store.updatePage(2);
      store.updateSize(25);
      store.updateSort('title');

      store.fetchRecords(buildFetchParams());

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        'documents-index',
        expect.objectContaining({
          query: 'test',
          page: 2,
          itemsPerPage: 25,
          sort: 'title',
        }),
      );
    });

    it('should set loading state before fetching', async () => {
      store.fetchRecords(buildFetchParams());

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(store.isLoading()).toBe(false); // Will be false after results are set
    });

    it('should update results after successful fetch', async () => {
      store.fetchRecords(buildFetchParams());

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(store.total()).toBe(2);
      expect(store.hits().length).toBe(2);
      expect(store.isLoading()).toBe(false);
    });

    it('should clear results when fetch returns empty', async () => {
      mockRecordService.getRecords.mockReturnValue(
        of({
          hits: {
            hits: [],
            total: { value: 0, relation: 'eq' },
          },
          aggregations: {},
          links: { self: '' },
        }),
      );

      store.fetchRecords(buildFetchParams());

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(store.total()).toBe(0);
      expect(store.hits()).toEqual([]);
    });

    it('should handle errors from RecordService', async () => {
      mockRecordService.getRecords.mockReturnValue(throwError(() => new Error('Network error')));

      store.fetchRecords(buildFetchParams());

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(store.isLoading()).toBe(false);
    });

    it('should include aggregationsFilters in request', async () => {
      store.updateAggregationsFilter('author', ['Smith', 'Jones']);

      store.fetchRecords(buildFetchParams());

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          aggregationsFilters: expect.arrayContaining([expect.objectContaining({ key: 'author' })]),
        }),
      );
    });
    it('should include preFilters from config', async () => {
      store.fetchRecords(buildFetchParams());

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          preFilters: { status: 'published' },
        }),
      );
    });

    it('should include listHeaders from config', async () => {
      store.fetchRecords(buildFetchParams());

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { 'X-Custom': 'value' },
        }),
      );
    });
  });

  describe('aggregations feature', () => {
    it('should update aggregation filters', () => {
      store.updateAggregationsFilter('author', ['Smith']);
      const filters = store.aggregationsFilters();
      const hasAuthorFilter = filters.some((f) => f.key === 'author');
      expect(hasAuthorFilter).toBe(true);
    });

    it('should remove filter values', () => {
      store.updateAggregationsFilter('author', ['Smith', 'Jones']);
      store.removeFilterValue('author', 'Smith');

      const filter = store.aggregationsFilters().find((f) => f.key === 'author');
      expect(filter?.values).not.toContain('Smith');
      expect(filter?.values).toContain('Jones');
    });

    it('should remove entire filter', () => {
      store.updateAggregationsFilter('author', ['Smith']);
      store.removeFilter('author');

      const filter = store.aggregationsFilters().find((f) => f.key === 'author');
      expect(filter).toBeUndefined();
    });

    it('should check if filter exists', () => {
      store.updateAggregationsFilter('author', ['Smith']);
      expect(store.hasFilter('author', 'Smith')).toBe(true);
      expect(store.hasFilter('author', 'Jones')).toBe(false);
      expect(store.hasFilter('subject', 'any')).toBe(false);
    });

    it('should update aggregations data', () => {
      const aggregations: any = [];
      store.updateAggregations(aggregations);
      expect(store.aggregations()).toEqual(aggregations);
    });

    it('should clear all filters', () => {
      store.updateAggregationsFilter('author', ['Smith']);
      store.updateAggregationsFilter('year', ['2023']);
      store.updateAggregationsFilters([]);

      expect(store.aggregationsFilters()).toEqual([]);
    });
  });

  describe('search params feature', () => {
    beforeEach(() => {
      // Setup configs for testing
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents' } as any, { key: 'persons', label: 'Persons' } as any],
      });
      // Initialize currentType after config is set
      store.updateCurrentType('documents');
    });

    it('should update search params individually', () => {
      store.updateQuery('test');
      store.updatePage(3);
      store.updateSize(50);
      store.updateSort('date');

      expect(store.q()).toBe('test');
      expect(store.page()).toBe(3);
      expect(store.size()).toBe(50);
      expect(store.sort()).toBe('date');
    });

    it('should update individual search parameters', () => {
      store.updateQuery('new query');
      expect(store.q()).toBe('new query');

      store.updatePage(5);
      expect(store.page()).toBe(5);

      store.updateSize(100);
      expect(store.size()).toBe(100);

      store.updateSort('title');
      expect(store.sort()).toBe('title');
    });

    it('should update current type', () => {
      store.updateCurrentType('persons');
      expect(store.currentType()).toBe('persons');
    });

    it('should have default search params', () => {
      expect(store.q()).toBe('');
      expect(store.page()).toBe(1);
      expect(store.size()).toBe(10);
      expect(store.currentType()).toBe('documents');
    });
  });

  describe('config feature', () => {
    it('should update route config', () => {
      const config = {
        types: [{ key: 'books', label: 'Books', sortOptions: [] } as any],
      };
      store.updateRouteConfig(config);

      expect(store.configs().length).toBe(1);
      expect(store.configs()[0].key).toBe('books');
    });

    it('should throw error for unknown config type', () => {
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents', sortOptions: [] } as any],
      });

      store.updateCurrentType('unknown-type');

      expect(() => store.config()).toThrowError('Unknown config type: unknown-type');

      // Restore valid state to prevent effects from crashing
      store.updateCurrentType('documents');
    });

    it('should compute aggregationsOrder from config', () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            aggregationsOrder: ['author', 'year'],
            sortOptions: [],
          } as any,
        ],
      });
      store.updateCurrentType('documents');

      const order = store.config().aggregationsOrder;
      expect(order).toEqual(['author', 'year']);
    });

    it('should compute aggregationsExpand from function in config', () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            aggregationsExpand: () => ['author'],
            sortOptions: [],
          } as any,
        ],
      });
      store.updateCurrentType('documents');

      const expand = store.aggregationsExpand();
      expect(expand).toEqual(['author']);
    });

    it('should compute aggregationsExpand from array in config', () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            aggregationsExpand: ['year', 'language'],
            sortOptions: [],
          } as any,
        ],
      });
      store.updateCurrentType('documents');

      expect(store.aggregationsExpand()).toEqual(['year', 'language']);
    });

    it('should return empty array when aggregationsExpand is not set', () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            sortOptions: [],
          } as any,
        ],
      });
      store.updateCurrentType('documents');

      expect(store.aggregationsExpand()).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should set error state', () => {
      const error: any = { status: 500, title: 'Test error', message: 'Error message' };
      store.setError(error);

      expect(store.error()).toBe(error);
      expect(store.isLoading()).toBe(false);
    });

    it('should clear error on successful results', () => {
      const error: any = { status: 500, title: 'Previous error' };
      store.setError(error);
      store.setResults(mockEsResult);

      expect(store.error()).toBeNull();
    });

    it('should clear results and error', () => {
      store.setResults(mockEsResult);
      const error: any = { status: 500, title: 'Test' };
      store.setError(error);

      store.clearResults();

      expect(store.total()).toBe(0);
      expect(store.hits()).toEqual([]);
      expect(store.error()).toBeNull();
    });
  });

  describe('results computed properties', () => {
    it('should compute hasRecords', () => {
      expect(store.hasRecords()).toBe(false);

      store.setResults(mockEsResult);
      expect(store.hasRecords()).toBe(true);
    });

    it('should compute isEmpty', () => {
      expect(store.isEmpty()).toBe(true);

      store.setResults(mockEsResult);
      expect(store.isEmpty()).toBe(false);
    });

    it('should extract hits from results', () => {
      store.setResults(mockEsResult);

      const hits = store.hits();
      expect(hits.length).toBe(2);
      expect(hits[0].id).toBe('1');
      expect(hits[1].id).toBe('2');
    });

    it('should compute total from results', () => {
      store.setResults(mockEsResult);
      expect(store.total()).toBe(2);
    });
  });

  describe('Hooks and initialization effects', () => {
    beforeEach(() => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            searchFields: [{ path: 'title', label: 'Title' }],
            searchFilters: [{ filter: 'status', label: 'Status', value: 'published' }],
            sortOptions: [
              { value: 'best', label: 'Best', defaultQuery: true, defaultNoQuery: false, icon: '' },
              { value: 'newest', label: 'Newest', defaultQuery: false, defaultNoQuery: true, icon: '' },
            ],
          } as any,
        ],
      });
    });

    it('should select default sort for no query', () => {
      store.updateQuery('');
      store.updateCurrentType('documents');

      expect(store.activeSort()).toBe('newest');
    });

    it('should select default sort for query', () => {
      store.updateQuery('some search');
      store.updateCurrentType('documents');

      expect(store.activeSort()).toBe('best');
    });

    it('should apply defaultSearchInputFilters when no query', async () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            defaultSearchInputFilters: [
              { key: 'status', values: ['published'] },
              { key: 'type', values: ['article'] },
            ],
            sortOptions: [],
          } as any,
        ],
      });
      store.updateQuery('');
      store.updateCurrentType('documents');

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(store.hasFilter('status', 'published')).toBe(true);
      expect(store.hasFilter('type', 'article')).toBe(true);
    });

    it('should not apply defaultSearchInputFilters when query is present', async () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            defaultSearchInputFilters: [{ key: 'status', values: ['published'] }],
            sortOptions: [],
          } as any,
        ],
      });
      store.updateQuery('some search');
      store.updateCurrentType('documents');

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(store.hasFilter('status', 'published')).toBe(false);
    });
  });

  describe('processBuckets()', () => {
    it('should set aggregationKey and indeterminate on bucket', () => {
      const bucket: any = {
        key: 'value1',
        doc_count: 10,
      };

      const result = store.processBuckets(bucket, 'author');

      expect(bucket.aggregationKey).toBe('author');
      expect(bucket.indeterminate).toBe(false);
      expect(result).toBe(false);
    });

    it('should process child buckets recursively', () => {
      const bucket: any = {
        key: 'parent',
        doc_count: 20,
        year: {
          buckets: [
            { key: '2020', doc_count: 5 },
            { key: '2021', doc_count: 10 },
          ],
        },
      };

      store.processBuckets(bucket, 'author');

      expect(bucket.year.buckets[0].parent).toBe(bucket);
      expect(bucket.year.buckets[1].parent).toBe(bucket);
      expect(bucket.year.buckets[0].aggregationKey).toBe('year');
      expect(bucket.year.buckets[1].aggregationKey).toBe('year');
    });

    it('should set indeterminate to true when child has active filter', () => {
      store.updateAggregationsFilter('year', ['2020']);

      const bucket: any = {
        key: 'parent',
        doc_count: 20,
        year: {
          buckets: [
            { key: '2020', doc_count: 5 },
            { key: '2021', doc_count: 10 },
          ],
        },
      };

      const result = store.processBuckets(bucket, 'author');

      expect(bucket.indeterminate).toBe(true);
      expect(result).toBe(true);
    });

    it('should process deeply nested buckets', () => {
      store.updateAggregationsFilter('language', ['en']);

      const bucket: any = {
        key: 'parent',
        doc_count: 100,
        year: {
          buckets: [
            {
              key: '2020',
              doc_count: 50,
              language: {
                buckets: [
                  { key: 'en', doc_count: 30 },
                  { key: 'fr', doc_count: 20 },
                ],
              },
            },
          ],
        },
      };

      const result = store.processBuckets(bucket, 'author');

      expect(bucket.year.buckets[0].language.buckets[0].parent).toBe(bucket.year.buckets[0]);
      expect(bucket.year.buckets[0].indeterminate).toBe(true);
      expect(bucket.indeterminate).toBe(true);
      expect(result).toBe(true);
    });
  });

  describe('enrichAggregation()', () => {
    it('should enrich aggregation with ES data and process buckets by default', () => {
      const aggregation: Aggregation = {
        key: 'author',
        value: { buckets: [] },
        expanded: false,
        loaded: false,
        doc_count: 0,
        name: 'Author',
        bucketSize: 10,
      };

      const esAggregation = {
        buckets: [
          { key: 'Smith', doc_count: 10 },
          { key: 'Jones', doc_count: 5 },
        ],
        doc_count: 15,
        type: 'terms',
        name: 'Author Name',
      };

      const enriched = store.enrichAggregation(aggregation, esAggregation);

      expect(enriched.value.buckets.length).toBe(2);
      expect(enriched.doc_count).toBe(15);
      expect(enriched.type).toBe('terms');
      expect(enriched.loaded).toBe(true);
      expect(enriched.key).toBe('author');
      expect(enriched.value.buckets[0].aggregationKey).toBe('author');
      expect(enriched.value.buckets[1].aggregationKey).toBe('author');
    });

    it('should preserve original values when ES data is missing', () => {
      const aggregation: Aggregation = {
        key: 'author',
        value: { buckets: [{ key: 'Existing', doc_count: 1, aggregationKey: 'author' }] },
        expanded: false,
        loaded: false,
        doc_count: 5,
        name: 'Author',
        bucketSize: 10,
        type: 'terms',
      };

      const esAggregation = {};

      const enriched = store.enrichAggregation(aggregation, esAggregation);

      expect(enriched.value.buckets.length).toBe(1);
      expect(enriched.doc_count).toBe(5);
      expect(enriched.type).toBe('terms');
      expect(enriched.loaded).toBe(true);
    });

    it('should not process buckets when processBuckets is false', () => {
      const aggregation: Aggregation = {
        key: 'author',
        value: { buckets: [] },
        expanded: false,
        loaded: false,
        doc_count: 0,
        name: 'Author',
        bucketSize: 10,
      };

      const esAggregation = {
        buckets: [
          { key: 'Smith', doc_count: 10 },
          { key: 'Jones', doc_count: 5 },
        ],
      };

      const enriched = store.enrichAggregation(aggregation, esAggregation, false);

      expect(enriched.value.buckets.length).toBe(2);
      expect(enriched.value.buckets[0].aggregationKey).toBeUndefined();
      expect(enriched.value.buckets[1].aggregationKey).toBeUndefined();
    });

    it('should process nested buckets with active filters', () => {
      store.updateAggregationsFilter('year', ['2020']);

      const aggregation: Aggregation = {
        key: 'author',
        value: { buckets: [] },
        expanded: false,
        loaded: false,
        doc_count: 0,
        name: 'Author',
        bucketSize: 10,
      };

      const esAggregation = {
        buckets: [
          {
            key: 'Smith',
            doc_count: 10,
            year: {
              buckets: [
                { key: '2020', doc_count: 5 },
                { key: '2021', doc_count: 5 },
              ],
            },
          },
        ],
      };

      const enriched = store.enrichAggregation(aggregation, esAggregation);

      expect(enriched.value.buckets[0].indeterminate).toBe(true);
    });
  });

  describe('facetsParameter', () => {
    it('should return empty array when no aggregations', () => {
      expect(store.facetsParameter()).toEqual([]);
    });

    it('should include aggregations with included=true', () => {
      store.updateAggregations([{ key: 'author', included: true } as any, { key: 'year', included: false } as any]);

      expect(store.facetsParameter()).toEqual(['author']);
    });

    it('should include expanded aggregations', () => {
      store.updateAggregations([{ key: 'author', expanded: true } as any, { key: 'year', expanded: false } as any]);

      expect(store.facetsParameter()).toEqual(['author']);
    });

    it('should include aggregations that have active filters', () => {
      store.updateAggregations([
        { key: 'author', included: false, expanded: false } as any,
        { key: 'year', included: false, expanded: false } as any,
        { key: 'language', included: false, expanded: false } as any,
      ]);

      store.updateAggregationsFilter('author', ['Smith']);

      expect(store.facetsParameter()).toEqual(['author']);
    });

    it('should combine all conditions', () => {
      store.updateAggregations([
        { key: 'author', included: true, expanded: false } as any,
        { key: 'year', included: false, expanded: true } as any,
        { key: 'language', included: false, expanded: false } as any,
        { key: 'subject', included: false, expanded: false } as any,
      ]);

      store.updateAggregationsFilter('language', ['en']);

      expect(store.facetsParameter()).toEqual(['author', 'language', 'year']);
    });

    it('should not duplicate keys', () => {
      store.updateAggregations([{ key: 'author', included: true, expanded: true } as any]);

      store.updateAggregationsFilter('author', ['Smith']);

      expect(store.facetsParameter()).toEqual(['author']);
    });
  });

  describe('fetchAggregationBuckets()', () => {
    beforeEach(() => {
      store.updateCurrentType('documents');
      store.updateQuery('test');
    });

    it('should call API with correct parameters for aggregation buckets', () => {
      // Setup initial aggregations
      store.updateAggregations([
        {
          key: 'author',
          value: { buckets: [] },
          expanded: true,
          loaded: false,
          doc_count: 0,
          name: 'Author',
          bucketSize: 10,
        } as Aggregation,
      ]);

      // Mock API response
      const mockResponse = {
        hits: { hits: [], total: { value: 0, relation: 'eq' } },
        aggregations: {
          author: {
            buckets: [
              { key: 'Smith', doc_count: 10 },
              { key: 'Jones', doc_count: 5 },
            ],
            doc_count: 15,
            type: 'terms',
          },
        },
        links: { self: '' },
      };

      mockRecordService.getRecords.mockReturnValue(of(mockResponse));

      // Call rxMethod
      store.fetchAggregationBuckets({
        aggregationKey: 'author',
      });

      // Verify API was called with correct parameters
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        'documents',
        expect.objectContaining({
          itemsPerPage: 1,
          facets: ['author'],
          query: 'test',
        }),
      );
    });

    it('should not fetch if aggregation is already loaded', () => {
      store.updateAggregations([
        {
          key: 'author',
          value: { buckets: [{ key: 'Smith', doc_count: 10 }] },
          expanded: true,
          loaded: true, // Already loaded
          doc_count: 10,
          name: 'Author',
          bucketSize: 10,
        } as Aggregation,
      ]);

      store.fetchAggregationBuckets({
        aggregationKey: 'author',
      });

      expect(mockRecordService.getRecords).not.toHaveBeenCalled();
    });

    it('should not fetch if aggregation does not exist', () => {
      store.updateAggregations([]);

      store.fetchAggregationBuckets({
        aggregationKey: 'nonexistent',
      });

      expect(mockRecordService.getRecords).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', () => {
      store.updateAggregations([
        {
          key: 'author',
          value: { buckets: [] },
          expanded: true,
          loaded: false,
          doc_count: 0,
          name: 'Author',
          bucketSize: 10,
        } as Aggregation,
      ]);

      mockRecordService.getRecords.mockReturnValue(throwError(() => new Error('Network error')));

      vi.spyOn(console, 'error');

      store.fetchAggregationBuckets({
        aggregationKey: 'author',
      });

      // Verify error was logged (error handler is called synchronously in rxMethod)
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch buckets'), expect.any(Error));
    });

    it('should automatically process buckets (set aggregationKey and indeterminate)', () => {
      store.updateAggregations([
        {
          key: 'author',
          value: { buckets: [] },
          expanded: true,
          loaded: false,
          doc_count: 0,
          name: 'Author',
          bucketSize: 10,
        } as Aggregation,
      ]);

      const mockResponse = {
        hits: { hits: [], total: { value: 0, relation: 'eq' } },
        aggregations: {
          author: {
            buckets: [
              { key: 'Smith', doc_count: 10 },
              { key: 'Jones', doc_count: 5 },
            ],
          },
        },
        links: { self: '' },
      };

      mockRecordService.getRecords.mockReturnValue(of(mockResponse));

      store.fetchAggregationBuckets({
        aggregationKey: 'author',
      });

      // Verify API was called
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        'documents',
        expect.objectContaining({
          itemsPerPage: 1,
          facets: ['author'],
        }),
      );
    });

    it('should use store parameters (query, filters, config) automatically', () => {
      // Set up store state with filters and specific config
      store.updateAggregations([
        {
          key: 'author',
          value: { buckets: [] },
          expanded: true,
          loaded: false,
          doc_count: 0,
          name: 'Author',
          bucketSize: 10,
        } as Aggregation,
      ]);
      store.updateAggregationsFilter('language', ['en']);
      store.updateQuery('quantum');

      const mockResponse = {
        hits: { hits: [], total: { value: 0, relation: 'eq' } },
        aggregations: {
          author: {
            buckets: [{ key: 'Einstein', doc_count: 42 }],
          },
        },
        links: { self: '' },
      };

      mockRecordService.getRecords.mockReturnValue(of(mockResponse));

      store.fetchAggregationBuckets({
        aggregationKey: 'author',
      });

      // Verify that getRecords was called with store's state (including filters and query)
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        'documents',
        expect.objectContaining({
          query: 'quantum',
          aggregationsFilters: expect.arrayContaining([expect.objectContaining({ key: 'language', values: ['en'] })]),
          itemsPerPage: 1,
          facets: ['author'],
        }),
      );
    });
  });

  describe('Permission methods (can*Record$)', () => {
    const mockRecord = {
      id: '1',
      metadata: { title: 'Test' },
      created: '',
      updated: '',
      links: { self: '' },
    };

    beforeEach(() => {
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents', sortOptions: [] } as any],
      });
      store.updateCurrentType('documents');
    });

    describe('canAddRecord$', () => {
      it('should return true by default when no canAdd is configured', async () => {
        store.canAddRecord$().subscribe((status) => {
          expect(status.can).toBe(true);
          expect(status.message).toBe('');
        });
      });

      it('should use config canAdd function when configured', async () => {
        store.updateRouteConfig({
          types: [
            {
              key: 'documents',
              label: 'Documents',
              sortOptions: [],
              canAdd: () => of({ can: false, message: 'Cannot add' }),
            } as any,
          ],
        });
        store.updateCurrentType('documents');

        store.canAddRecord$().subscribe((status) => {
          expect(status.can).toBe(false);
          expect(status.message).toBe('Cannot add');
        });
      });
    });

    describe('canUpdateRecord$', () => {
      it('should return true by default from DEFAULT_RECORD_TYPE', async () => {
        store.canUpdateRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(true);
          expect(status.message).toBe('');
        });
      });

      it('should use config canUpdate function when configured', async () => {
        store.updateRouteConfig({
          types: [
            {
              key: 'documents',
              label: 'Documents',
              sortOptions: [],
              canUpdate: (_record: any) => of({ can: false, message: 'Cannot update this record' }),
            } as any,
          ],
        });
        store.updateCurrentType('documents');

        store.canUpdateRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(false);
          expect(status.message).toBe('Cannot update this record');
        });
      });

      it('should prefer canUpdate over permissions when both are configured', async () => {
        store.updateRouteConfig({
          types: [
            {
              key: 'documents',
              label: 'Documents',
              sortOptions: [],
              canUpdate: (_record: any) => of({ can: false, message: 'canUpdate wins' }),
              permissions: (_record: any) =>
                of({
                  canUpdate: { can: true, message: 'Should not use this' },
                }),
            } as any,
          ],
        });
        store.updateCurrentType('documents');

        store.canUpdateRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(false);
          expect(status.message).toBe('canUpdate wins');
        });
      });
    });

    describe('canDeleteRecord$', () => {
      it('should return true by default when no canDelete is configured', async () => {
        store.canDeleteRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(true);
          expect(status.message).toBe('');
        });
      });

      it('should use config canDelete function when configured', async () => {
        store.updateRouteConfig({
          types: [
            {
              key: 'documents',
              label: 'Documents',
              sortOptions: [],
              canDelete: (_record: any) => of({ can: false, message: 'Record is in use' }),
            } as any,
          ],
        });
        store.updateCurrentType('documents');

        store.canDeleteRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(false);
          expect(status.message).toBe('Record is in use');
        });
      });

      it('should use permissions function when configured', async () => {
        store.updateRouteConfig({
          types: [
            {
              key: 'documents',
              label: 'Documents',
              sortOptions: [],
              permissions: (_record: any) =>
                of({
                  canDelete: { can: true, message: '' },
                }),
            } as any,
          ],
        });
        store.updateCurrentType('documents');

        store.canDeleteRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(true);
        });
      });
    });

    describe('canReadRecord$', () => {
      it('should return true by default when no canRead is configured', async () => {
        store.canReadRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(true);
          expect(status.message).toBe('');
        });
      });

      it('should use config canRead function when configured', async () => {
        store.updateRouteConfig({
          types: [
            {
              key: 'documents',
              label: 'Documents',
              sortOptions: [],
              canRead: (_record: any) => of({ can: false, message: 'Restricted' }),
            } as any,
          ],
        });
        store.updateCurrentType('documents');

        store.canReadRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(false);
          expect(status.message).toBe('Restricted');
        });
      });

      it('should use permissions function when configured', async () => {
        store.updateRouteConfig({
          types: [
            {
              key: 'documents',
              label: 'Documents',
              sortOptions: [],
              permissions: (_record: any) =>
                of({
                  canRead: { can: true, message: '' },
                }),
            } as any,
          ],
        });
        store.updateCurrentType('documents');

        store.canReadRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(true);
        });
      });
    });

    describe('canUseRecord$', () => {
      it('should return true by default from DEFAULT_RECORD_TYPE', async () => {
        store.canUseRecord$(mockRecord).subscribe((status) => {
          expect(status.can).toBe(true);
          expect(status.message).toBe('');
        });
      });

      it('should use config canUse function when configured', async () => {
        store.updateRouteConfig({
          types: [
            {
              key: 'documents',
              label: 'Documents',
              sortOptions: [],
              canUse: (_record: any) => of({ can: true, message: '', url: '/use/1' }),
            } as any,
          ],
        });
        store.updateCurrentType('documents');

        store.canUseRecord$(mockRecord).subscribe((status: any) => {
          expect(status.can).toBe(true);
          expect(status.url).toBe('/use/1');
        });
      });

      it('should prefer canUse over permissions when both are configured', async () => {
        store.updateRouteConfig({
          types: [
            {
              key: 'documents',
              label: 'Documents',
              sortOptions: [],
              canUse: (_record: any) => of({ can: true, message: '', url: '/use/1' }),
              permissions: (_record: any) =>
                of({
                  canUse: { can: false, message: 'No access' },
                }),
            } as any,
          ],
        });
        store.updateCurrentType('documents');

        store.canUseRecord$(mockRecord).subscribe((status: any) => {
          expect(status.can).toBe(true);
          expect(status.url).toBe('/use/1');
        });
      });
    });
  });
});
