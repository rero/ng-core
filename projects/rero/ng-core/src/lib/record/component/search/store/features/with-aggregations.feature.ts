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

import { computed, Signal } from '@angular/core';
import { patchState, signalStoreFeature, type, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, filter, pipe, switchMap, tap } from 'rxjs';
import { Aggregation, Bucket, EsResult } from '../../../../../model';
import { RecordType } from '../../../../model';
import { RecordService } from '../../../../service/record/record.service';
import { AggregationsFilter } from '../../model/aggregations-filter.interface';
import { FetchRecordsParams } from './with-results.feature';
import { shallowEqual } from '../../../../record-search-utils';

/**
 * Aggregations state interface
 */
export interface AggregationsState {
  /** Available aggregations from search results */
  aggregations: Aggregation[];
}

/**
 * Feature that manages aggregations state and processing.
 *
 * Requires withConfig and withSearchParams to be composed before this feature.
 *
 * State:
 * - aggregations: Array of aggregation objects
 *
 * Computed:
 * - facetsParameter: Array of aggregation keys to include in search facets
 *
 * Methods:
 * - updateAggregations(), clearAggregations()
 * - processBuckets(): Recursively process buckets for parent refs and indeterminate state
 * - enrichAggregation(): Enrich an aggregation with Elasticsearch response data
 * - fetchAggregationBuckets(): Lazily fetch buckets for an aggregation via API
 *
 * @returns SignalStore feature for aggregations management
 */
export function withAggregations() {
  return signalStoreFeature(
    {
      state: type<{
        aggregationsFilters: AggregationsFilter[];
        sort: string;
        q: string;
        esResult: EsResult | null;
        currentType: string;
      }>(),
      props: type<{
        config: Signal<RecordType>;
        currentIndex: Signal<string>;
        aggregationsExpand: Signal<string[]>;
        recordService: RecordService;
      }>(),
      methods: type<{
        hasFilter(aggregationKey: string, bucketKey: string): boolean;
        setLoading(isLoading: boolean): void;
      }>(),
    },
    withState<AggregationsState>({
      aggregations: [],
    }),
    withComputed((store) => ({
      facetsParameter: computed(
        () => {
          const aggregations = store.aggregations();
          if (!aggregations?.length) return [];

          const filterKeys = new Set(
            store.aggregationsFilters().map(f => f.key)
          );

          // 1. Calcul
          const result = aggregations
            .filter(agg =>
              agg.included === true ||
              agg.expanded === true ||
              filterKeys.has(agg?.key)
            )
            .map(agg => agg.key);

          // 2. Normalisation d'ordre (indépendance)
          result.sort(); // tri lexical stable

          return result;
        },
        { equal: shallowEqual }
      )
    })),
    withMethods((store) => ({
      /**
       * Update available aggregations from search results
       * @param aggregations Aggregations from Elasticsearch response
       */
      updateAggregations(aggregations: Aggregation[]): void {
        const current = store.aggregations();
        if (shallowEqual(current, aggregations)) {
          return;
        }
        patchState(store, { aggregations });
      },

      /**
       * Clear aggregations
       */
      clearAggregations(): void {
        patchState(store, { aggregations: [] });
      },
    })),
    // processBuckets and enrichAggregation must be in a separate withMethods block
    // so they are available on `store` when fetchAggregationBuckets (rxMethod) is created.
    withMethods((store) => ({
      /**
       * Process buckets recursively to set parent references and indeterminate state
       * @param bucket Elastic bucket to process
       * @param aggregationKey Bucket parent key
       * @returns The indeterminate state of the bucket
       */
      processBuckets(bucket: Bucket, aggregationKey: string): boolean {
        // checkbox indeterminate state
        bucket.indeterminate = false;
        bucket.aggregationKey = aggregationKey;
        for (const k of Object.keys(bucket).filter((key) => bucket[key].buckets)) {
          for (const childBucket of bucket[k].buckets) {
            // set the parent as non-enumerable to avoid circular traversal in equality checks
            Object.defineProperty(childBucket, 'parent', {
              value: bucket,
              writable: true,
              configurable: true,
              enumerable: false,
            });
            // store the aggregation key as we re-organize the bucket structure
            bucket.indeterminate ||= store.hasFilter(k, childBucket.key);
            // do not change the order of the boolean expression to force processBucket over all
            // recursion steps
            bucket.indeterminate = this.processBuckets(childBucket, k) || bucket.indeterminate;
          }
        }
        return bucket.indeterminate;
      },

      /**
       * Enrich an aggregation with data from Elasticsearch response
       * @param aggregation Target aggregation object
       * @param esAggregation Aggregation data from Elasticsearch
       * @param processBuckets If true, automatically process buckets (default: true)
       */
      enrichAggregation(aggregation: Aggregation, esAggregation: any, processBuckets = true): Aggregation {
        const enriched = {
          ...aggregation,
          doc_count: esAggregation.doc_count || aggregation.doc_count,
          type: esAggregation.type || aggregation.type || 'terms',
          config: esAggregation.config || aggregation.config,
          name: aggregation.name || esAggregation.name,
          value: {
            ...aggregation.value,
            buckets: esAggregation.buckets || aggregation.value.buckets,
          },
          loaded: true,
        };

        // Process buckets automatically if requested
        if (processBuckets && enriched.value.buckets) {
          enriched.value.buckets.forEach((bucket: Bucket) => this.processBuckets(bucket, enriched.key));
        }
        return enriched;
      },
    })),
    withMethods((store) => ({
      /**
       * Fetch aggregation buckets for a specific aggregation key.
       * This method calls the API with size=1 to get only aggregation data without fetching many records.
       * Buckets are automatically processed to set parent references and indeterminate states.
       */
      fetchAggregationBuckets: rxMethod<{
        aggregationKey: string;
      }>(
        pipe(
          tap(() => store.setLoading(true)),
          switchMap((params) => {
            const aggregations = store.aggregations();
            const aggregationsFilters = store.aggregationsFilters();
            const config = store.config();
            const sort = store.sort();
            const currentIndex = store.currentIndex();
            const query = store.q();

            const aggregation = aggregations.find((agg) => agg.key === params.aggregationKey);
            if (!aggregation) {
              store.setLoading(false);
              return EMPTY;
            }
            if (aggregation.loaded) {
              store.setLoading(false);
              return EMPTY;
            }

            const searchParams: FetchRecordsParams = {
              index: currentIndex,
              query: query,
              page: 1,
              itemsPerPage: 1,
              aggregationsFilters: aggregationsFilters,
              preFilters: config.preFilters,
              facets: [params.aggregationKey],
              headers: config?.listHeaders,
              sort: sort,
            };

            return store.recordService.getRecords(searchParams.index, searchParams).pipe(
              tap((esResult: EsResult) => {
                store.setLoading(false);
                if (esResult.aggregations && esResult.aggregations[params.aggregationKey]) {
                  const currentAggregations = store.aggregations();
                  // Update only the specific aggregation
                  const updatedAggregations = currentAggregations.map((agg) => {
                    if (agg.key === params.aggregationKey) {
                      return store.enrichAggregation(agg, esResult.aggregations[params.aggregationKey]);
                    }
                    return agg;
                  });
                  store.updateAggregations(updatedAggregations);
                }
              }),
              catchError((error) => {
                store.setLoading(false);
                console.error('Failed to fetch buckets', error);
                return EMPTY;
              }),
            );
          }),
        ),
      ),
      initializeAggregations: rxMethod<{ currentType: string, config: RecordType }>(
        pipe(
          filter((params) => !!params.currentType),
          filter((params) => params.config.aggregationsOrder.length > 0),
          tap((params) => {
            const aggregationsOrder = params.config.aggregationsOrder;
            if (aggregationsOrder) {
              store.updateAggregations(
                aggregationsOrder.map<Aggregation>((key) => ({
                  key: key,
                  bucketSize: store.config().aggregationsBucketSize,
                  value: { buckets: [] },
                  expanded: store.aggregationsExpand().includes(key),
                  included: ([...store.aggregationsExpand(), ...store.config().aggregationsHide]).includes(key),
                  doc_count: 0,
                  name: key,
                })),
              );
            }
          }),
        ),
      ),
      setAggregations: rxMethod<{ currentType: string; esResult: EsResult } | null>(
        pipe(
          tap((params) => {
            if (params == null) {
              return;
            }
            const currentAggregations = store.aggregations();
            const updatedAggregations = currentAggregations.map((agg) => {
              if (params.esResult.aggregations?.[agg.key]) {
                return store.enrichAggregation(agg, params.esResult.aggregations[agg.key]);
              }
              return agg;
            });
            store.updateAggregations([...updatedAggregations]);
          }),
        ),
      ),
    })),
    withHooks((store) => ({
      onInit() {
        store.initializeAggregations(computed(() => ({ currentType: store.currentType(), config: store.config() })));
        const tracked = computed(() => {
          const esResult = store.esResult();
          if (!esResult) {
            return null;
          }
          return {
            currentType: store.currentType(),
            esResult: esResult,
          };
        });
        store.setAggregations(tracked);
      },
    })),
  );
}
