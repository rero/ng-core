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
import { signalStore } from '@ngrx/signals';
import { Aggregation, Bucket } from '../../../../../model';
import { withConfig } from './with-config.feature';
import { withAggregations } from './with-aggregations.feature';
import { withResults } from './with-results.feature';
import { withSearchParams } from './with-search-params.feature';
import { of } from 'rxjs';
import { RecordService } from '../../../../service/record/record.service';

describe('withAggregations feature', () => {
  const TestStore = signalStore(
    { providedIn: 'root' },
    withSearchParams(),
    withConfig(),
    withResults(),
    withAggregations(),
  );
  let store: InstanceType<typeof TestStore>;
  let mockRecordService: any;

  beforeEach(() => {
    mockRecordService = {
      getRecords: vi.fn(),
    };
    // Default return value
    mockRecordService.getRecords.mockReturnValue(of({}));
    TestBed.configureTestingModule({
      providers: [TestStore, { provide: RecordService, useValue: mockRecordService }],
    });
    store = TestBed.inject(TestStore);
  });

  describe('Initial state', () => {
    it('should initialize with empty aggregationsFilters', () => {
      expect(store.aggregationsFilters()).toEqual([]);
    });

    it('should initialize with empty aggregations', () => {
      expect(store.aggregations()).toEqual([]);
    });
  });

  describe('Hooks and initialization', () => {
    it('should initialize aggregations from aggregationsOrder config', async () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            aggregationsOrder: ['author', 'year', 'language'],
            aggregationsExpand: ['author'],
            aggregationsBucketSize: 20,
            sortOptions: [],
          } as any,
        ],
      });
      store.setCurrentType('documents');

      await new Promise((resolve) => setTimeout(resolve, 50));
      const aggregations = store.aggregations();
      expect(aggregations.length).toBe(3);
      expect(aggregations[0].key).toBe('author');
      expect(aggregations[1].key).toBe('year');
      expect(aggregations[2].key).toBe('language');
      expect(aggregations[0].expanded).toBe(true);
      expect((aggregations[0] as any).included).toBe(true);
      expect(aggregations[1].expanded).toBe(false);
      expect((aggregations[1] as any).included).toBe(false);
      expect(aggregations[0].bucketSize).toBe(20);
    });

    it('should enrich aggregations from esResult when not loaded', async () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            aggregationsOrder: ['author'],
            sortOptions: [],
          } as any,
        ],
      });
      store.setCurrentType('documents');

      await new Promise((resolve) => setTimeout(resolve, 50));
      const agg = store.aggregations().find((a) => a.key === 'author');
      expect(agg).toBeDefined();
      expect(agg!.loaded).toBeFalsy();

      store.setResults({
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
        } as any,
        links: { self: '' },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      const enriched = store.aggregations().find((a) => a.key === 'author');
      expect(enriched!.loaded).toBe(true);
      expect(enriched!.value.buckets.length).toBe(2);
      expect(enriched!.doc_count).toBe(15);
    });
  });

  describe('updateFilters()', () => {
    it('should update aggregations filters', () => {
      const filters = [
        { key: 'author', values: ['Smith', 'Jones'] },
        { key: 'year', values: ['2020', '2021'] },
      ];

      store.updateAggregationsFilters(filters);

      // Values are sorted alphabetically within each filter
      expect(store.aggregationsFilters()).toEqual([
        { key: 'author', values: ['Jones', 'Smith'] },
        { key: 'year', values: ['2020', '2021'] },
      ]);
    });

    it('should sort values within each filter', () => {
      const filters = [{ key: 'author', values: ['Smith', 'Brown', 'Jones'] }];

      store.updateAggregationsFilters(filters);

      expect(store.aggregationsFilters()[0].values).toEqual(['Brown', 'Jones', 'Smith']);
    });

    it('should replace existing filters', () => {
      store.updateAggregationsFilters([{ key: 'author', values: ['Smith'] }]);
      store.updateAggregationsFilters([{ key: 'year', values: ['2020'] }]);

      expect(store.aggregationsFilters()).toEqual([{ key: 'year', values: ['2020'] }]);
    });
  });

  describe('updateFilter()', () => {
    it('should add a new filter', () => {
      store.updateAggregationsFilter('author', ['Smith', 'Jones']);

      expect(store.aggregationsFilters()).toEqual([{ key: 'author', values: ['Jones', 'Smith'] }]);
    });

    it('should update an existing filter', () => {
      store.updateAggregationsFilter('author', ['Smith']);
      store.updateAggregationsFilter('author', ['Jones', 'Brown']);

      expect(store.aggregationsFilters()).toEqual([{ key: 'author', values: ['Brown', 'Jones'] }]);
    });

    it('should remove filter when values are empty', () => {
      store.updateAggregationsFilter('author', ['Smith']);
      store.updateAggregationsFilter('author', []);

      expect(store.aggregationsFilters()).toEqual([]);
    });

    it('should sort values alphabetically', () => {
      store.updateAggregationsFilter('author', ['Zebra', 'Apple', 'Monkey']);

      expect(store.aggregationsFilters()[0].values).toEqual(['Apple', 'Monkey', 'Zebra']);
    });

    it('should handle multiple filters', () => {
      store.updateAggregationsFilter('author', ['Smith']);
      store.updateAggregationsFilter('year', ['2020']);

      expect(store.aggregationsFilters()).toEqual([
        { key: 'author', values: ['Smith'] },
        { key: 'year', values: ['2020'] },
      ]);
    });
  });

  describe('removeFilter()', () => {
    it('should remove a filter by key', () => {
      store.updateAggregationsFilters([
        { key: 'author', values: ['Smith'] },
        { key: 'year', values: ['2020'] },
      ]);

      store.removeFilter('author');

      expect(store.aggregationsFilters()).toEqual([{ key: 'year', values: ['2020'] }]);
    });

    it('should do nothing if filter does not exist', () => {
      store.updateAggregationsFilters([{ key: 'author', values: ['Smith'] }]);

      store.removeFilter('nonexistent');

      expect(store.aggregationsFilters()).toEqual([{ key: 'author', values: ['Smith'] }]);
    });
  });

  describe('removeFilterValue()', () => {
    it('should remove a specific value from a filter', () => {
      store.updateAggregationsFilter('author', ['Smith', 'Jones', 'Brown']);

      store.removeFilterValue('author', 'Jones');

      expect(store.aggregationsFilters()[0].values).toEqual(['Brown', 'Smith']);
    });

    it('should remove entire filter when last value is removed', () => {
      store.updateAggregationsFilter('author', ['Smith']);

      store.removeFilterValue('author', 'Smith');

      expect(store.aggregationsFilters()).toEqual([]);
    });

    it('should do nothing if filter does not exist', () => {
      store.updateAggregationsFilter('author', ['Smith']);

      store.removeFilterValue('nonexistent', 'value');

      expect(store.aggregationsFilters()).toEqual([{ key: 'author', values: ['Smith'] }]);
    });

    it('should do nothing if value does not exist in filter', () => {
      store.updateAggregationsFilter('author', ['Smith']);

      store.removeFilterValue('author', 'nonexistent');

      expect(store.aggregationsFilters()).toEqual([{ key: 'author', values: ['Smith'] }]);
    });
  });

  describe('clearFilters()', () => {
    it('should clear all filters', () => {
      store.updateAggregationsFilters([
        { key: 'author', values: ['Smith'] },
        { key: 'year', values: ['2020'] },
      ]);

      store.clearFilters();

      expect(store.aggregationsFilters()).toEqual([]);
    });
  });

  describe('updateAggregations()', () => {
    it('should update aggregations from search results', () => {
      const aggregations: Aggregation[] = [
        {
          key: 'author',
          bucketSize: 10,
          value: { buckets: [] },
          expanded: false,
          doc_count: 100,
          name: 'Author',
        },
        {
          key: 'year',
          bucketSize: 10,
          value: { buckets: [] },
          expanded: false,
          doc_count: 50,
          name: 'Year',
        },
      ];

      store.updateAggregations(aggregations);

      expect(store.aggregations()).toEqual(aggregations);
    });

    it('should replace existing aggregations', () => {
      const agg1: Aggregation[] = [
        {
          key: 'author',
          bucketSize: 10,
          value: { buckets: [] },
          expanded: false,
          doc_count: 100,
          name: 'Author',
        },
      ];

      const agg2: Aggregation[] = [
        {
          key: 'year',
          bucketSize: 10,
          value: { buckets: [] },
          expanded: false,
          doc_count: 50,
          name: 'Year',
        },
      ];

      store.updateAggregations(agg1);
      store.updateAggregations(agg2);

      expect(store.aggregations()).toEqual(agg2);
    });
  });

  describe('clearAggregations()', () => {
    it('should clear all aggregations', () => {
      const aggregations: Aggregation[] = [
        {
          key: 'author',
          bucketSize: 10,
          value: { buckets: [] },
          expanded: false,
          doc_count: 100,
          name: 'Author',
        },
      ];

      store.updateAggregations(aggregations);
      store.clearAggregations();

      expect(store.aggregations()).toEqual([]);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle typical filter workflow', () => {
      // Add first filter
      store.updateAggregationsFilter('author', ['Smith']);
      expect(store.aggregationsFilters().length).toBe(1);

      // Add second filter
      store.updateAggregationsFilter('year', ['2020', '2021']);
      expect(store.aggregationsFilters().length).toBe(2);

      // Update first filter
      store.updateAggregationsFilter('author', ['Smith', 'Jones']);
      expect(store.aggregationsFilters().length).toBe(2);
      expect(store.aggregationsFilters()[0].values).toEqual(['Jones', 'Smith']);

      // Remove value from filter
      store.removeFilterValue('year', '2020');
      expect(store.aggregationsFilters()[1].values).toEqual(['2021']);

      // Clear all
      store.clearFilters();
      expect(store.aggregationsFilters()).toEqual([]);
    });

    it('should maintain filters independently from aggregations', () => {
      const filters = [{ key: 'author', values: ['Smith'] }];
      const aggregations: Aggregation[] = [
        {
          key: 'author',
          bucketSize: 10,
          value: { buckets: [] },
          expanded: false,
          doc_count: 100,
          name: 'Author',
        },
      ];

      store.updateAggregationsFilters(filters);
      store.updateAggregations(aggregations);

      expect(store.aggregationsFilters()).toEqual(filters);
      expect(store.aggregations()).toEqual(aggregations);

      store.clearFilters();
      expect(store.aggregations()).toEqual(aggregations); // Aggregations not affected

      store.clearAggregations();
      expect(store.aggregations()).toEqual([]);
    });
  });

  describe('Recursive Aggregation Filters', () => {
    let complexBucket: any;

    beforeEach(() => {
      complexBucket = {
        key: 'child',
        aggregationKey: 'sub_agg',
        parent: {
          key: 'parent',
          aggregationKey: 'main_agg',
        },
        other_agg: {
          buckets: [{ key: 'grandchild', aggregationKey: 'other_agg' }],
        },
      };
    });

    it('should remove parent filters recursively', () => {
      store.updateAggregationsFilter('main_agg', ['parent']);
      store.updateAggregationsFilter('sub_agg', ['child']);

      store.removeParentFilters(complexBucket);

      expect(store.hasFilter('main_agg', 'parent')).toBe(false);
      expect(store.hasFilter('sub_agg', 'child')).toBe(false);
    });

    it('should remove children filters recursively', () => {
      store.updateAggregationsFilter('sub_agg', ['child']);
      store.updateAggregationsFilter('other_agg', ['grandchild']);

      store.removeChildrenFilters(complexBucket);

      expect(store.hasFilter('other_agg', 'grandchild')).toBe(false);
      expect(store.hasFilter('sub_agg', 'child')).toBe(true); // self is not removed by removeChildrenFilters
    });

    it('should identify if children filters exist', () => {
      expect(store.hasChildrenFilter(complexBucket)).toBe(false);

      store.updateAggregationsFilter('other_agg', ['grandchild']);
      expect(store.hasChildrenFilter(complexBucket)).toBe(true);
    });

    it('should remove all related filters with removeAggregationFilter', () => {
      store.updateAggregationsFilter('main_agg', ['parent']);
      store.updateAggregationsFilter('sub_agg', ['child']);
      store.updateAggregationsFilter('other_agg', ['grandchild']);

      store.removeAggregationFilter('sub_agg', complexBucket);

      expect(store.aggregationsFilters()).toEqual([]);
    });
  });

  describe('facetsParameter', () => {
    it('should return empty array when no aggregations', () => {
      expect(store.facetsParameter()).toEqual([]);
    });

    it('should return included, expanded, or filtered aggregations', () => {
      const aggregations: any[] = [
        {
          key: 'a1',
          included: true,
          value: { buckets: [] },
          bucketSize: 10,
          expanded: false,
          doc_count: 0,
          name: 'A1',
        },
        {
          key: 'a2',
          expanded: true,
          value: { buckets: [] },
          bucketSize: 10,
          included: false,
          doc_count: 0,
          name: 'A2',
        },
        {
          key: 'a3',
          included: false,
          expanded: false,
          value: { buckets: [] },
          bucketSize: 10,
          doc_count: 0,
          name: 'A3',
        },
        {
          key: 'a4',
          included: false,
          expanded: false,
          value: { buckets: [] },
          bucketSize: 10,
          doc_count: 0,
          name: 'A4',
        },
      ];

      store.updateAggregations(aggregations);
      store.updateAggregationsFilter('a4', ['val']);

      expect(store.facetsParameter()).toEqual(['a1', 'a2', 'a4']);
    });
  });

  describe('processBuckets', () => {
    it('should process buckets recursively', () => {
      const bucket: Bucket = {
        key: 'parent',
        doc_count: 10,
        sub: {
          buckets: [{ key: 'child', doc_count: 5 }],
        },
      } as any;

      store.processBuckets(bucket, 'aggKey');

      expect(bucket.aggregationKey).toBe('aggKey');
      expect((bucket as any).sub.buckets[0].parent).toBe(bucket);
      expect(bucket.indeterminate).toBe(false);
    });

    it('should set indeterminate true if filtered', () => {
      store.updateAggregationsFilter('sub', ['child']);

      const bucket: Bucket = {
        key: 'parent',
        doc_count: 10,
        sub: {
          buckets: [{ key: 'child', doc_count: 5 }],
        },
      } as any;

      const result = store.processBuckets(bucket, 'aggKey');

      expect(result).toBe(true);
      expect(bucket.indeterminate).toBe(true);
    });
  });

  describe('enrichAggregation', () => {
    it('should enrich aggregation with ES data', () => {
      const aggregation: Aggregation = {
        key: 'test',
        bucketSize: 10,
        value: { buckets: [] },
        expanded: false,
        doc_count: 0,
        name: 'Test',
      };

      const esAggregation = {
        doc_count: 100,
        buckets: [{ key: 'b1', doc_count: 50 }],
      };

      const result = store.enrichAggregation(aggregation, esAggregation);

      expect(result.doc_count).toBe(100);
      expect(result.value.buckets.length).toBe(1);
      expect(result.loaded).toBe(true);
      // Verify processing happened (parent ref check on bucket would be ideal but simple check suffices)
      expect((result.value.buckets[0] as any).aggregationKey).toBe('test');
    });
  });

  describe('fetchAggregationBuckets', () => {
    it('should fetch and update buckets', () => {
      const aggregation: Aggregation = {
        key: 'test',
        bucketSize: 10,
        value: { buckets: [] },
        expanded: false,
        doc_count: 0,
        name: 'Test',
        loaded: false,
      };
      store.updateAggregations([aggregation]);
      store.updateRouteConfig({ types: [{ key: 'doc', preFilters: {} } as any] });
      store.setCurrentType('doc');

      mockRecordService.getRecords.mockReturnValue(
        of({
          aggregations: {
            test: {
              doc_count: 50,
              buckets: [{ key: 'b1', doc_count: 50 }],
            },
          },
          hits: { hits: [], total: { value: 0, relation: 'eq' } },
          links: { self: '' },
        }),
      );

      store.fetchAggregationBuckets({ aggregationKey: 'test' });

      expect(mockRecordService.getRecords).toHaveBeenCalled();
      const aggs = store.aggregations();
      expect(aggs[0].loaded).toBe(true);
      expect(aggs[0].value.buckets.length).toBe(1);
    });
  });
});
