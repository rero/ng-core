/**
 * Feature that provides computed properties for building search parameters.
 * These are derived values calculated from the store store.
 */
import { computed } from '@angular/core';
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Bucket } from '../../../../../model/record.interface';
import { pipe, tap } from 'rxjs';
import { SearchField, SearchFilter, SearchFilterSection } from '../../../../../model';
import { SearchParams } from '../../../../model';
import { shallowEqual } from '../../../../record-search-utils';
import { AggregationsFilter } from '../../model';

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  q: '',
  page: 1,
  size: 10,
  sort: '',
  index: '',
  aggregationsFilters: [],
  searchFields: [],
  searchFilters: [],
};

/** Collect {key, value} pairs from parent bucket chain (pure function) */
function collectParentRemovals(bucket: Bucket): { key: string; value: string }[] {
  const removals: { key: string; value: string }[] = [];
  if (bucket.parent) {
    removals.push(...collectParentRemovals(bucket.parent));
  }
  removals.push({ key: bucket.aggregationKey, value: bucket.key });
  return removals;
}

/** Collect {key, value} pairs from children buckets (pure function) */
function collectChildrenRemovals(bucket: Bucket): { key: string; value: string }[] {
  const removals: { key: string; value: string }[] = [];
  for (const k of Object.keys(bucket).filter((key) => bucket[key].buckets)) {
    for (const childBucket of bucket[k].buckets) {
      removals.push({ key: k, value: childBucket.key });
      removals.push(...collectChildrenRemovals(childBucket));
    }
  }
  return removals;
}

/** Apply a list of {key, value} removals to an aggregations filters array (pure function) */
function applyRemovals(
  filters: AggregationsFilter[],
  removals: { key: string; value: string }[],
): AggregationsFilter[] {
  let result = filters;
  for (const removal of removals) {
    const filterIndex = result.findIndex((f) => f.key === removal.key);
    if (filterIndex >= 0) {
      const newValues = result[filterIndex].values.filter((v) => v !== removal.value);
      if (newValues.length === 0) {
        result = result.filter((f) => f.key !== removal.key);
      } else {
        result = [...result];
        result[filterIndex] = { ...result[filterIndex], values: newValues };
      }
    }
  }
  return result;
}

export function withSearchParams() {
  return signalStoreFeature(
    withState<SearchParams>({ ...DEFAULT_SEARCH_PARAMS }),
    withComputed((store) => ({
      searchParams: computed(() => ({
        q: store.q(),
        page: store.page(),
        size: store.size(),
        sort: store.sort(),
        index: store.index(),
        aggregationsFilters: store.aggregationsFilters(),
        searchFields: store.searchFields(),
        searchFilters: store.searchFilters(),
      })),
      queryString: computed(() => {
        const q = store.q();
        const searchFields = store.searchFields() ?? [];

        // Filter to get selected search fields
        const selectedFields = searchFields.filter((f: SearchField) => f.selected);

        if (!q || selectedFields.length === 0) {
          return q;
        }

        // Loop over select fields and add them to final query string
        const queries: string[] = selectedFields.map((field: SearchField) => `${field.path}:(${q})`);
        return queries.join(' ');
      }),

      /** Get a flat array of all search filters (extracts filters from sections) */
      flatSearchFilters: computed(() => {
        const flat: SearchFilter[] = [];
        (store.searchFilters() ?? []).forEach((item) => {
          if ('filters' in item) {
            flat.push(...item.filters);
          } else {
            flat.push(item);
          }
        });
        return flat;
      }),

      /** Check if any search filters are available */
      hasSearchFilters: computed(() => (store.searchFilters() ?? []).length > 0),
    })),
    withMethods((store) => ({
      syncUrlParams: rxMethod<Partial<SearchParams>>(
        pipe(
          tap((urlParams) => {
            const current = store.searchParams();
            const next = { ...current, ...urlParams };

            if (shallowEqual(current, next)) {
              return;
            }

            patchState(store, urlParams);
          }),
        ),
      ),
      updateQuery(q: string): void {
        patchState(store, { q, page: 1 });
      },
      updatePage(page: number) {
        patchState(store, { page });
      },
      updateSearchFilters(searchFilters: (SearchFilter | SearchFilterSection)[]) {
        patchState(store, { searchFilters });
      },
      clearSearchFilters(): void {
        patchState(store, { searchFilters: [] });
      },
      updateSize(size: number) {
        patchState(store, { size });
      },
      updateSort(sort: string) {
        patchState(store, { sort });
      },

      /**
       * Add or update a single aggregation filter.
       * When a bucket is provided, parent and children filters are removed atomically.
       * @param key Filter key (aggregation name)
       * @param values Filter values
       * @param bucket Optional bucket for hierarchical removal
       */
      updateAggregationsFilter(key: string, values: string[], bucket?: Bucket): void {
        let currentFilters = store.aggregationsFilters();

        // Collect and apply parent/children removals in memory (no intermediate patchState)
        if (bucket) {
          const removals = [...collectParentRemovals(bucket), ...collectChildrenRemovals(bucket)];
          currentFilters = applyRemovals(currentFilters, removals);
        }

        const existingIndex = currentFilters.findIndex((f: AggregationsFilter) => f.key === key);
        let newFilters: AggregationsFilter[];
        if (values.length === 0) {
          newFilters = currentFilters.filter((f: AggregationsFilter) => f.key !== key);
        } else if (existingIndex >= 0) {
          newFilters = [...currentFilters];
          newFilters[existingIndex] = { key, values: [...values].sort() };
        } else {
          newFilters = [...currentFilters, { key, values: [...values].sort() }];
        }
        patchState(store, { aggregationsFilters: newFilters });
      },

      /**
       * Replace all aggregation filters at once.
       * @param filters New set of aggregation filters (values are sorted within each filter)
       */
      updateAggregationsFilters(filters: AggregationsFilter[]): void {
        patchState(store, {
          aggregationsFilters: filters.map((f) => ({ key: f.key, values: [...f.values].sort() })),
        });
      },

      /**
       * Remove a specific filter by key
       * @param key Filter key to remove
       */
      removeFilter(key: string): void {
        const newFilters = store.aggregationsFilters().filter((f) => f.key !== key);
        patchState(store, { aggregationsFilters: newFilters });
      },

      /**
       * Remove a specific value from a filter
       * @param key Filter key
       * @param value Value to remove
       */
      removeFilterValue(key: string, value: string): void {
        const currentFilters = store.aggregationsFilters();
        const filter = currentFilters.find((f) => f.key === key);

        if (filter) {
          const newValues = filter.values.filter((v) => v !== value);
          this.updateAggregationsFilter(key, newValues);
        }
      },

      /**
       * Clear all aggregations filters
       */
      clearFilters(): void {
        patchState(store, { aggregationsFilters: [] });
      },
      /**
       * Check if a given filter exists in the current aggregations filters
       * @param key Filter name/key
       * @param value Filter value
       * @returns true if the filter exists
       */
      hasFilter(key: string, value: string): boolean {
        const filter = store.aggregationsFilters().find((a) => a.key === key);
        return !!(filter && filter.values.some((v) => v === value));
      },

      /**
       * Remove the given value from selected filters and removes all children
       * and parent selected values atomically (single state update).
       * @param key Aggregation key
       * @param bucket Bucket containing the value to remove
       */
      removeAggregationFilter(key: string, bucket: any): void {
        const removals = [
          { key, value: bucket.key.toString() },
          ...collectChildrenRemovals(bucket),
          ...collectParentRemovals(bucket),
        ];
        const newFilters = applyRemovals(store.aggregationsFilters(), removals);
        patchState(store, { aggregationsFilters: newFilters });
      },

      /**
       * Remove the parent filters of a given bucket (single state update).
       * @param bucket The ElasticSearch bucket
       */
      removeParentFilters(bucket: Bucket): void {
        const removals = collectParentRemovals(bucket);
        const newFilters = applyRemovals(store.aggregationsFilters(), removals);
        patchState(store, { aggregationsFilters: newFilters });
      },

      /**
       * Removes children filters of a given bucket (single state update).
       * @param bucket The ElasticSearch bucket
       */
      removeChildrenFilters(bucket: Bucket): void {
        const removals = collectChildrenRemovals(bucket);
        const newFilters = applyRemovals(store.aggregationsFilters(), removals);
        patchState(store, { aggregationsFilters: newFilters });
      },

      /**
       * Check if a children filter of a given bucket exists
       * @param bucket The ElasticSearch bucket
       * @returns true if the bucket has children with a corresponding filter
       */
      hasChildrenFilter(bucket: Bucket): boolean {
        for (const k of Object.keys(bucket).filter((key) => typeof bucket[key] === 'object' && bucket[key].buckets)) {
          const aggregationsKey = k;
          for (const childBucket of bucket[k].buckets) {
            if (this.hasFilter(aggregationsKey, childBucket.key) || this.hasChildrenFilter(childBucket)) {
              return true;
            }
          }
        }
        return false;
      },
    })),
  );
}
