// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { computed, inject, Injector } from '@angular/core';
import { signalStore, withComputed, withHooks, withMethods, withProps } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { _, TranslateService } from '@ngx-translate/core';
import { filter, pipe, tap } from 'rxjs';
import { RecordType } from '../../../model';
import { shallowEqual } from '../../../record-search-utils';
import { withAggregations } from './features/with-aggregations.feature';
import { withConfig } from './features/with-config.feature';
import { FetchRecordsParams, withResults } from './features/with-results.feature';
import { withSearchFields } from './features/with-search-fields.feature';
import { withSearchParams } from './features/with-search-params.feature';

/**
 * RecordSearchStore - SignalStore for managing record search state
 *
 * This store manages all state related to record search including:
 * - Search query and parameters (via withSearchParams)
 * - Results and loading state (via withResults)
 * - Aggregations and filters (via withAggregations)
 * - Search fields selection (via withSearchFields)
 * - Configuration and current type (via withConfig)
 *
 * The store is provided at component level to support multiple instances.
 */
export const RecordSearchStore = signalStore(
  // Compose features progressively
  withSearchParams(),
  withConfig(),
  withResults(),
  withAggregations(),
  withSearchFields(),
  withProps(() => ({
    translateService: inject(TranslateService),
  })),
  withComputed((store) => ({
    resultsText: computed((): string => {
      const esResult = store.esResult();
      const total = store.total();
      const resultsText = store.config().resultsText;
      if (resultsText && esResult) {
        return resultsText(esResult.hits);
      }
      return total <= 1 ? _('{{ total }} result') : _('{{ total }} results');
    }),
  })),

  withMethods((store) => ({
    updateCurrentType(currentType: string) {
      if (currentType !== store.currentType()) {
        store.clearResults();
      }
      store.setCurrentType(currentType);
    },
    applyDefaultFilters: rxMethod<{ currentType: string; config: RecordType }>(
      pipe(
        filter((params) => !!params.currentType),
        filter(() => !store.queryString()),
        filter((params) => params.config.defaultSearchInputFilters?.length > 0),
        tap((params) => {
          params.config.defaultSearchInputFilters.forEach((filter) => {
            store.updateAggregationsFilter(filter.key, filter.values);
          });
        }),
      ),
    ),
    initializeSearchFilters: rxMethod<{ currentType: string; config: RecordType }>(
      pipe(
        filter((params) => !!params.currentType),
        filter((params) => params.config.searchFilters?.length > 0),
        tap((params) => {
          const filters = params.config.searchFilters || [];
          if (!shallowEqual(filters, store.searchFilters())) {
            store.updateSearchFilters(filters);
          }
        }),
      ),
    ),
  })),
  withHooks((store) => {
    const injector = inject(Injector);
    return {
      onInit() {
        store.applyDefaultFilters(computed(() => ({ currentType: store.currentType(), config: store.config() })), { injector });
        store.initializeSearchFilters(computed(() => ({ currentType: store.currentType(), config: store.config() })), { injector });
        // Fetch records when search parameters change
        // Build a computed signal that produces FetchRecordsParams (or null if not ready)
        const fetchParams = computed((): FetchRecordsParams | null => {
          const currentType = store.currentType();
          if (!currentType) return null;
          const config = store.config();
          return {
            index: store.currentIndex(),
            query: store.queryString(),
            page: store.page(),
            allowEmptySearch: config.allowEmptySearch,
            itemsPerPage: store.size(),
            aggregationsFilters: store.aggregationsFilters(),
            preFilters: config.preFilters,
            sort: store.sort(),
            facets: store.facetsParameter(),
            headers: config.listHeaders,
          };
        });
        store.fetchRecords(fetchParams, { injector });
      },
    };
  }),
);
