import { TestBed } from '@angular/core/testing';
import { patchState, signalStore } from '@ngrx/signals';
import { BehaviorSubject } from 'rxjs';

import { RecordService } from '../../../../service/record/record.service';
import { withAggregations } from './with-aggregations.feature';
import { withConfig } from './with-config.feature';
import { withResults } from './with-results.feature';
import { withSearchParams } from './with-search-params.feature';

describe('withSearchParams', () => {
  // Create a store that composes all required features
  const TestStore = signalStore(
    { providedIn: 'root', protectedState: false },
    withSearchParams(),
    withConfig(),
    withResults(),
    withAggregations(),
  );

  let mockRecordService: any;

  beforeEach(() => {
    mockRecordService = {
      getRecords: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [TestStore, { provide: RecordService, useValue: mockRecordService }],
    });
  });

  describe('syncUrlParams rxMethod', () => {
    it('should exist as a method on the store', () => {
      const store = TestBed.inject(TestStore);
      expect(typeof store.syncUrlParams).toBe('function');
    });

    it('should be an rxMethod that accepts observables', () => {
      const store = TestBed.inject(TestStore);
      const urlParams$ = new BehaviorSubject({ currentType: 'documents', q: 'test' });

      // Must run inside an injection context so rxMethod can resolve DestroyRef
      expect(() => TestBed.runInInjectionContext(() => store.syncUrlParams(urlParams$))).not.toThrow();
    });
  });

  describe('patchState', () => {
    it('should update multiple params at once', () => {
      const store = TestBed.inject(TestStore);

      patchState(store, {
        q: 'new query',
        page: 3,
        size: 50,
        sort: 'date',
      });

      expect(store.q()).toBe('new query');
      expect(store.page()).toBe(3);
      expect(store.size()).toBe(50);
      expect(store.sort()).toBe('date');
    });

    it('should not update if params are identical', () => {
      const store = TestBed.inject(TestStore);

      // Set initial params
      patchState(store, { q: 'test', page: 1 });

      // Try to update with same params
      patchState(store, { q: 'test', page: 1 });

      // Values should remain the same
      expect(store.q()).toBe('test');
      expect(store.page()).toBe(1);
    });
  });

  describe('individual update methods', () => {
    it('should reset page to 1 when query changes', () => {
      const store = TestBed.inject(TestStore);

      patchState(store, { page: 5 });
      expect(store.page()).toBe(5);

      store.updateQuery('new search');

      expect(store.q()).toBe('new search');
      expect(store.page()).toBe(1); // Page should reset
    });

    it('should update page without affecting other params', () => {
      const store = TestBed.inject(TestStore);

      patchState(store, { q: 'test', size: 25 });
      store.updatePage(3);

      expect(store.page()).toBe(3);
      expect(store.q()).toBe('test');
      expect(store.size()).toBe(25);
    });

    it('should update size without affecting other params', () => {
      const store = TestBed.inject(TestStore);

      patchState(store, { q: 'test', page: 2 });
      store.updateSize(100);

      expect(store.size()).toBe(100);
      expect(store.q()).toBe('test');
      expect(store.page()).toBe(2);
    });

    it('should update sort', () => {
      const store = TestBed.inject(TestStore);

      store.updateSort('title');
      expect(store.sort()).toBe('title');

      store.updateSort('-created');
      expect(store.sort()).toBe('-created');
    });
  });

  describe('clearFilters', () => {
    it('should reset aggregations filters to empty array when no simple filter exists', () => {
      const store = TestBed.inject(TestStore);
      store.syncUrlParams({ aggregationsFilters: [{ key: 'language', values: ['eng'] }] });

      store.clearFilters();

      expect(store.aggregationsFilters()).toEqual([]);
    });

    it('should keep the simple filter reset to "1" when its value was "0"', () => {
      const store = TestBed.inject(TestStore);
      store.syncUrlParams({
        aggregationsFilters: [
          { key: 'language', values: ['eng'] },
          { key: 'simple', values: ['0'] },
        ],
      });

      store.clearFilters();

      expect(store.aggregationsFilters()).toEqual([{ key: 'simple', values: ['1'] }]);
    });

    it('should keep the simple filter reset to "1" when its value was already "1"', () => {
      const store = TestBed.inject(TestStore);
      store.syncUrlParams({
        aggregationsFilters: [
          { key: 'language', values: ['eng'] },
          { key: 'simple', values: ['1'] },
        ],
      });

      store.clearFilters();

      expect(store.aggregationsFilters()).toEqual([{ key: 'simple', values: ['1'] }]);
    });

    it('should reset page to 1 when clearing filters', () => {
      const store = TestBed.inject(TestStore);
      store.updatePage(5);

      store.clearFilters();

      expect(store.page()).toBe(1);
    });
  });

  describe('hasFilters', () => {
    it('should return false when no aggregations filters exist', () => {
      const store = TestBed.inject(TestStore);
      expect(store.hasFilters()).toBe(false);
    });

    it('should return true when a non-simple filter exists', () => {
      const store = TestBed.inject(TestStore);
      store.syncUrlParams({ aggregationsFilters: [{ key: 'language', values: ['eng'] }] });

      expect(store.hasFilters()).toBe(true);
    });

    it('should return false when only the simple filter exists with value "1"', () => {
      const store = TestBed.inject(TestStore);
      store.syncUrlParams({ aggregationsFilters: [{ key: 'simple', values: ['1'] }] });

      expect(store.hasFilters()).toBe(false);
    });

    it('should return true when only the simple filter exists with value "0"', () => {
      const store = TestBed.inject(TestStore);
      store.syncUrlParams({ aggregationsFilters: [{ key: 'simple', values: ['0'] }] });

      expect(store.hasFilters()).toBe(true);
    });

    it('should return true when simple is "1" but another filter is also active', () => {
      const store = TestBed.inject(TestStore);
      store.syncUrlParams({
        aggregationsFilters: [
          { key: 'simple', values: ['1'] },
          { key: 'language', values: ['eng'] },
        ],
      });

      expect(store.hasFilters()).toBe(true);
    });
  });
});
