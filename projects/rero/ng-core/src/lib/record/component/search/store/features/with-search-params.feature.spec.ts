
import { TestBed } from '@angular/core/testing';
import { patchState, signalStore } from '@ngrx/signals';
import { BehaviorSubject } from 'rxjs';
import { SearchFilter, SearchFilterSection } from '../../../../../model/record.interface';
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

  describe('queryString', () => {
    it('should return original query when no search fields selected', () => {
      const store = TestBed.inject(TestStore);

      patchState(store, {
        searchFields: [
          { path: 'title', label: 'Title', selected: false },
          { path: 'author', label: 'Author', selected: false },
        ],
      });

      store.updateQuery('test query');

      expect(store.queryString()).toBe('test query');
    });

    it('should return original query when query is empty', () => {
      const store = TestBed.inject(TestStore);

      patchState(store, {
        searchFields: [{ path: 'title', label: 'Title', selected: true }],
      });

      store.updateQuery('');

      expect(store.queryString()).toBe('');
    });

    it('should build query with single selected field', () => {
      const store = TestBed.inject(TestStore);

      patchState(store, {
        searchFields: [
          { path: 'title', label: 'Title', selected: true },
          { path: 'author', label: 'Author', selected: false },
        ],
      });

      store.updateQuery('science');

      expect(store.queryString()).toBe('title:(science)');
    });

    it('should build query with multiple selected fields', () => {
      const store = TestBed.inject(TestStore);

      patchState(store, {
        searchFields: [
          { path: 'title', label: 'Title', selected: true },
          { path: 'author', label: 'Author', selected: true },
          { path: 'subject', label: 'Subject', selected: false },
        ],
      });

      store.updateQuery('quantum');

      expect(store.queryString()).toBe('title:(quantum) author:(quantum)');
    });

    it('should handle complex query strings', () => {
      const store = TestBed.inject(TestStore);

      patchState(store, {
        searchFields: [{ path: 'title', label: 'Title', selected: true }],
      });

      store.updateQuery('quantum mechanics');

      expect(store.queryString()).toBe('title:(quantum mechanics)');
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

      // Should not throw when called with an observable
      expect(() => store.syncUrlParams(urlParams$)).not.toThrow();
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

  describe('updateSearchFilters', () => {
    it('should update with flat search filters', () => {
      const store = TestBed.inject(TestStore);
      const filters: SearchFilter[] = [
        { filter: 'status', label: 'Status', value: 'published', showIfQuery: false },
        { filter: 'language', label: 'Language', value: 'en', showIfQuery: true },
      ];

      store.updateSearchFilters(filters);

      expect(store.searchFilters()).toEqual(filters);
    });

    it('should update with search filter sections', () => {
      const store = TestBed.inject(TestStore);
      const sections: SearchFilterSection[] = [
        {
          label: 'Document Filters',
          filters: [
            { filter: 'type', label: 'Type', value: 'article', showIfQuery: false },
            { filter: 'format', label: 'Format', value: 'pdf', showIfQuery: false },
          ],
        },
      ];

      store.updateSearchFilters(sections);

      expect(store.searchFilters()).toEqual(sections);
    });

    it('should replace existing filters', () => {
      const store = TestBed.inject(TestStore);
      const initial: SearchFilter[] = [{ filter: 'old', label: 'Old', value: 'old_value', showIfQuery: false }];
      const updated: SearchFilter[] = [{ filter: 'new', label: 'New', value: 'new_value', showIfQuery: false }];

      store.updateSearchFilters(initial);
      store.updateSearchFilters(updated);

      expect(store.searchFilters()).toEqual(updated);
    });
  });

  describe('clearSearchFilters', () => {
    it('should reset filters to empty array', () => {
      const store = TestBed.inject(TestStore);
      store.updateSearchFilters([{ filter: 'test', label: 'Test', value: 'val', showIfQuery: false }]);

      store.clearSearchFilters();

      expect(store.searchFilters()).toEqual([]);
      expect(store.hasSearchFilters()).toBe(false);
    });
  });

  describe('flatSearchFilters', () => {
    it('should return empty array when no filters exist', () => {
      const store = TestBed.inject(TestStore);
      expect(store.flatSearchFilters()).toEqual([]);
    });

    it('should handle flat filters without modification', () => {
      const store = TestBed.inject(TestStore);
      const filters: SearchFilter[] = [
        { filter: 'status', label: 'Status', value: 'active', showIfQuery: false },
        { filter: 'type', label: 'Type', value: 'doc', showIfQuery: false },
      ];

      store.updateSearchFilters(filters);

      expect(store.flatSearchFilters()).toEqual(filters);
    });

    it('should flatten search filter sections', () => {
      const store = TestBed.inject(TestStore);
      const sections: SearchFilterSection[] = [
        {
          label: 'Group 1',
          filters: [
            { filter: 'f1', label: 'Filter 1', value: 'v1', showIfQuery: false },
            { filter: 'f2', label: 'Filter 2', value: 'v2', showIfQuery: false },
          ],
        },
        {
          label: 'Group 2',
          filters: [{ filter: 'f3', label: 'Filter 3', value: 'v3', showIfQuery: false }],
        },
      ];

      store.updateSearchFilters(sections);
      const flat = store.flatSearchFilters();

      expect(flat.length).toBe(3);
      expect(flat[0].filter).toBe('f1');
      expect(flat[1].filter).toBe('f2');
      expect(flat[2].filter).toBe('f3');
    });

    it('should handle mixed filters and sections', () => {
      const store = TestBed.inject(TestStore);
      const mixed: (SearchFilter | SearchFilterSection)[] = [
        { filter: 'standalone', label: 'Standalone', value: 'value', showIfQuery: false },
        {
          label: 'Section',
          filters: [
            { filter: 'grouped1', label: 'Grouped 1', value: 'g1', showIfQuery: false },
            { filter: 'grouped2', label: 'Grouped 2', value: 'g2', showIfQuery: false },
          ],
        },
        { filter: 'another', label: 'Another', value: 'val', showIfQuery: false },
      ];

      store.updateSearchFilters(mixed);
      const flat = store.flatSearchFilters();

      expect(flat.length).toBe(4);
      expect(flat[0].filter).toBe('standalone');
      expect(flat[1].filter).toBe('grouped1');
      expect(flat[2].filter).toBe('grouped2');
      expect(flat[3].filter).toBe('another');
    });
  });

  describe('hasSearchFilters', () => {
    it('should return false when no filters exist', () => {
      const store = TestBed.inject(TestStore);
      expect(store.hasSearchFilters()).toBe(false);
    });

    it('should return true when filters exist', () => {
      const store = TestBed.inject(TestStore);
      store.updateSearchFilters([{ filter: 'test', label: 'Test', value: 'val', showIfQuery: false }]);

      expect(store.hasSearchFilters()).toBe(true);
    });

    it('should return true when filter sections exist', () => {
      const store = TestBed.inject(TestStore);
      store.updateSearchFilters([{ label: 'Section', filters: [] } as SearchFilterSection]);

      expect(store.hasSearchFilters()).toBe(true);
    });

    it('should return false after clearing filters', () => {
      const store = TestBed.inject(TestStore);
      store.updateSearchFilters([{ filter: 'test', label: 'Test', value: 'val', showIfQuery: false }]);
      store.clearSearchFilters();

      expect(store.hasSearchFilters()).toBe(false);
    });
  });
});
