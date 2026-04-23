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
import { HttpHeaders } from '@angular/common/http';
import { computed } from '@angular/core';
import { patchState, signalStoreFeature, type, withComputed, withMethods, withState } from '@ngrx/signals';
import { Observable, of, switchMap } from 'rxjs';
import { first } from 'rxjs/operators';
import { ActionStatus, RecordData } from '../../../../../model';
import { RecordType } from '../../../../model/record-search.interface';
import { shallowEqual } from '../../../../record-search-utils';
import { DefaultSearchResultComponent } from '../../record-search/record-search-result/default-search-result/default-search-result.component';
import { DefaultDetailComponent } from '../../../detail/default-detail/default-detail.component';

export interface RouteConfig {
  /** Record type configurations */
  detailUrl: string;
  showSearchInput: boolean;
  adminMode: boolean;
  types: RecordType[];
}

export const DEFAULT_RECORD_TYPE: RecordType = {
  key: 'documents',
  label: 'Documents',
  index: '',
  component: DefaultSearchResultComponent,
  detailComponent: DefaultDetailComponent,
  canAdd: () => of({ can: true, message: '' }),
  canUpdate: () => of({ can: true, message: '' }),
  canDelete: () => of({ can: true, message: '' }),
  canRead: () => of({ can: true, message: '' }),
  canUse: () => of({ can: true, message: '' }),
  editorSettings: {
    longMode: true,
  },
  permissions: () => of({}),
  exportFormats: [],
  preFilters: {},
  defaultSearchInputFilters: [],
  listHeaders: new HttpHeaders({ 'Content-Type': 'application/json' }),
  itemHeaders: new HttpHeaders({ 'Content-Type': 'application/json' }),
  showFacetsIfNoResults: false,
  showLabel: true,
  allowEmptySearch: true,
  aggregationsName: {},
  aggregationsOrder: [],
  aggregationsExpand: [],
  aggregationsHide: [],
  aggregationsBucketSize: 0,
  searchFields: [],
  resultsText: null,
  pagination: {
    boundaryLinks: true,
    maxSize: 5,
    pageReport: false,
    rowsPerPageOptions: [10, 25, 50, 100],
  },
  sortOptions: [],
  formFieldMap: (field) => field,
  hideInTabs: false,
  preCreateRecord: (record) => record,
  preUpdateRecord: (record) => record,
  postprocessRecordEditor: (record) => record,
  preprocessRecordEditor: (record) => record,
  redirectUrl: () => of(''),
  deleteMessage: () => [],
  searchFilters: [],
};

export const DEFAULT_ROUTE_CONFIG: RouteConfig = {
  detailUrl: '',
  showSearchInput: true,
  adminMode: true,
  types: [DEFAULT_RECORD_TYPE],
};

/**
 * SignalStore feature for managing configuration and current type selection.
 *
 * State:
 * - routeConfig: Route configuration containing record type definitions
 * - currentType: Currently selected record type key
 *
 * Computed:
 * - configs: Array of RecordType from routeConfig
 * - config: Active RecordType selected by currentType
 * - currentIndex: Elasticsearch index for current type
 * - aggregationsExpand: Expanded aggregation keys
 *
 * Methods:
 * - updateRouteConfig(): Update route configuration
 * - setCurrentType(): Set the current record type
 * - canAddRecord$(), canUpdateRecord$(), canDeleteRecord$(), canReadRecord$(), canUseRecord$()
 */
export function withConfig() {
  return signalStoreFeature(
    {
      state: type<{
        q: string;
        sort: string;
      }>(),
    },
    withState({
      routeConfig: { ...DEFAULT_ROUTE_CONFIG },
      currentType: '',
    }),
    withComputed((store) => ({
      configs: computed(() => store.routeConfig().types),
      config: computed(() => {
        const configs = store.routeConfig().types;
        const currentType = store.currentType();
        if (!configs || !currentType) {
          return DEFAULT_RECORD_TYPE;
        }
        const config = configs.find((c) => c.key === currentType);
        if (!config) {
          throw new Error(`Unknown config type: ${currentType}`);
        }
        return config;
      }),
    })),
    withComputed((store) => ({
      currentIndex: computed(() => {
        const config = store.config();
        return config.index || config.key;
      }),
      aggregationsExpand: computed(() => {
        const config = store.config();
        const aggregationsExpand = config.aggregationsExpand;
        if (typeof aggregationsExpand === 'function') {
          return aggregationsExpand();
        }
        return aggregationsExpand ?? [];
      }),
      defaultSort: computed(() => {
        const config = store.config();
        const defaultKey = store.q() ? 'defaultQuery' : 'defaultNoQuery';
        return config.sortOptions.find((opt) => opt[defaultKey] === true)?.value || '';
      }),
    })),
    withComputed((store) => ({
      activeSort: computed(() => (store.sort() !== '' ? store.sort() : store.defaultSort())),
    })),
    withMethods((store) => ({
      /**
       * Update route configuration
       * @param config New route configuration
       */
      updateRouteConfig(partial: Partial<RouteConfig>) {
        const next = { ...store.routeConfig(), ...partial };
        next.types = next.types.map((type) => {
          return { ...DEFAULT_RECORD_TYPE, ...type };
        });
        if (shallowEqual(next, store.routeConfig())) return;
        patchState(store, { routeConfig: next });
      },

      /**
       * Set the current record type
       * @param currentType Record type key
       */
      setCurrentType(currentType: string) {
        if (currentType !== store.currentType()) {
          patchState(store, { currentType });
        }
      },

      /**
       * Check if a record can be added
       * @returns Observable resolving an object containing the result of a permission check.
       */
      canAddRecord$(): Observable<ActionStatus> {
        const config = store.config();
        return config.canAdd ? config.canAdd().pipe(first()) : of({ can: true, message: '' });
      },

      /**
       * Check if a record can be updated
       * @param record - Record to check
       * @returns Observable resolving an object containing the result of a permission check.
       */
      canUpdateRecord$(record: RecordData): Observable<ActionStatus> {
        const config = store.config();
        if (config.canUpdate) {
          return config.canUpdate(record).pipe(first());
        }
        if (config.permissions) {
          return config
            .permissions(record)
            .pipe(switchMap((perms) => ('canUpdate' in perms ? of(perms.canUpdate) : of({ can: true, message: '' }))));
        }
        return of({ can: true, message: '' });
      },

      /**
       * Check if a record can be deleted
       * @param record - Record to check
       * @returns Observable resolving an object containing the result of a permission check.
       */
      canDeleteRecord$(record: RecordData): Observable<ActionStatus> {
        const config = store.config();
        if (config.canDelete) {
          return config.canDelete(record).pipe(first());
        }
        if (config.permissions) {
          return config
            .permissions(record)
            .pipe(switchMap((perms) => ('canDelete' in perms ? of(perms.canDelete) : of({ can: true, message: '' }))));
        }
        return of({ can: true, message: '' });
      },

      /**
       * Check if a record can be read
       * @param record - Record to check
       * @returns Observable resolving an object containing the result of a permission check.
       */
      canReadRecord$(record: RecordData): Observable<ActionStatus> {
        const config = store.config();
        if (config.canRead) {
          return config.canRead(record).pipe(first());
        }
        if (config.permissions) {
          return config
            .permissions(record)
            .pipe(switchMap((perms) => ('canRead' in perms ? of(perms.canRead) : of({ can: true, message: '' }))));
        }
        return of({ can: true, message: '' });
      },

      /**
       * Check if a record can be used (mainly used for templates)
       * @param record - Record to check
       * @returns Observable resolving an object containing the result of a permission check.
       */
      canUseRecord$(record: RecordData): Observable<ActionStatus> {
        const config = store.config();
        if (config.canUse) {
          return config.canUse(record).pipe(first());
        }
        if (config.permissions) {
          return config
            .permissions(record)
            .pipe(switchMap((perms) => ('canUse' in perms ? of(perms.canUse) : of({ can: false, message: '' }))));
        }
        return of({ can: false, message: '' });
      },
    })),
  );
}
