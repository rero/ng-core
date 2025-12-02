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

import { HttpHeaders } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStoreFeature, type, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, filter, pipe, switchMap, tap } from 'rxjs';
import { Error } from '../../../../../core';
import { EsResult } from '../../../../../model';
import { RecordService } from '../../../../service/record/record.service';
import { AggregationsFilter } from '../../model/aggregations-filter.interface';

/**
 * Parameters for fetching records.
 * All values are passed explicitly to decouple from other features.
 */
export interface FetchRecordsParams {
  index: string;
  query: string;
  page: number;
  itemsPerPage: number;
  aggregationsFilters: AggregationsFilter[];
  preFilters: Record<string, string | string[]>;
  sort: string;
  facets: string[];
  headers?: HttpHeaders | Record<string, string | string[]>;
}

/**
 * State for search results management
 */
export interface ResultsState {
  /** Elasticsearch result object containing hits and total */
  esResult: EsResult | null;
  /** Loading state indicator */
  isLoading: boolean;
  /** Error object if search fails */
  error: Error | null;
}

/**
 * Feature for managing search results
 *
 * Provides:
 * - State: esResult, total, isLoading, error
 * - Computed: hits (array of record hits from ES), hasRecords, isEmpty
 * - Methods: setResults(), setLoading(), setError(), clearResults(), fetchRecords()
 */
export function withResults() {
  return signalStoreFeature(
    {
      state: type<{ currentType: string }>(),
    },
    withState<ResultsState>({
      esResult: null,
      isLoading: false,
      error: null,
    }),

    withComputed((store) => ({
      /** Extract hits array from Elasticsearch result */
      hits: computed(() => store.esResult()?.hits?.hits ?? []),

      total: computed(() => store.esResult()?.hits?.total?.value ?? 0),

      /** Check if there are any records */
      hasRecords: computed(() => (store.esResult()?.hits?.total?.value ?? 0) > 0),

      /** Check if result set is empty */
      isEmpty: computed(() => (store.esResult()?.hits?.total?.value ?? 0) === 0),
    })),

    withProps(() => ({
      recordService: inject(RecordService),
    })),

    withMethods((store) => ({
      /**
       * Update search results
       * @param esResult Elasticsearch result object
       */
      setResults(esResult: EsResult): void {
        patchState(store, {
          esResult,
          isLoading: false,
          error: null,
        });
      },

      /**
       * Update loading state
       * @param isLoading Loading indicator
       */
      setLoading(isLoading: boolean): void {
        patchState(store, { isLoading });
      },

      /**
       * Set error state
       * @param error Error object
       */
      setError(error: Error): void {
        patchState(store, {
          error,
          isLoading: false,
        });
      },

      /**
       * Clear all results
       */
      clearResults(): void {
        patchState(store, {
          esResult: null,
          error: null,
          isLoading: false,
        });
      },
    })),

    // fetchRecords must be in a separate withMethods block
    // so it can access setLoading/setResults defined above.
    withMethods((store) => ({
      fetchRecords: rxMethod<FetchRecordsParams | null>(
        pipe(
          // Skip null params (emitted when currentType is not set)
          filter((params) => !!params),
          tap((params) => {
            if (params != null) {
              store.setLoading(true);
            }
          }),
          switchMap((params) => {
            if (params == null) {
              return EMPTY;
            }
            return store.recordService.getRecords(params.index, {
              query: params.query,
              page: params.page,
              itemsPerPage: params.itemsPerPage,
              aggregationsFilters: params.aggregationsFilters,
              preFilters: params.preFilters,
              sort: params.sort,
              facets: params.facets,
              headers: params.headers,
            });
          }),
          tap((records) => {
            if (records != null) {
              store.setResults(records);
            }
          }),
          catchError(() => {
            store.setLoading(false);
            return EMPTY;
          }),
        ),
      ),
    })),
  );
}
