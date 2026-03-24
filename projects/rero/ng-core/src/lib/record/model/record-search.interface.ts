/*
 * RERO angular core
 * Copyright (C) 2022-2025 RERO
 * Copyright (C) 2022 UCLouvain
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
import { Type } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { JSONSchema7 } from 'projects/rero/ng-core/src/public-api';
import { Observable } from 'rxjs';
import {
  ActionStatus,
  Aggregation,
  EsResult,
  JsonObject,
  RecordData,
  SearchField,
  SearchFilter,
  SearchFilterSection,
} from '../../model';
import { AggregationsFilter } from '../component/search/model/aggregations-filter.interface';

export interface SearchParams {
  index: string;
  q: string;
  page: number;
  size: number;
  sort: string;
  aggregationsFilters: AggregationsFilter[];
  searchFields: SearchField[];
  searchFilters: (SearchFilter | SearchFilterSection)[];
}

export interface SortOption {
  value: string;
  label: string;
  defaultQuery: boolean;
  defaultNoQuery: boolean;
  icon: string;
}

export interface ExportFormat {
  label: string;
  format: string;
  endpoint: string;
  disableMaxRestResultsSize: boolean;
}

export interface RecordType<TMetadata = JsonObject> {
  key: string;
  label: string;
  index: string;
  component: Type<unknown>;
  canAdd: () => Observable<ActionStatus>;
  canUpdate: (record: RecordData<TMetadata>) => Observable<ActionStatus>;
  canDelete: (record: RecordData<TMetadata>) => Observable<ActionStatus>;
  canRead: (record: RecordData<TMetadata>) => Observable<ActionStatus>;
  canUse: (record: RecordData<TMetadata>) => Observable<ActionStatus>;
  permissions: (record: RecordData<TMetadata>) => Observable<Record<string, ActionStatus>>;
  exportFormats: ExportFormat[];
  preFilters: Record<string, string | string[]>;
  //list of filters to apply on load if the query is empty
  defaultSearchInputFilters: AggregationsFilter[];
  listHeaders: HttpHeaders | Record<string, string | string[]>;
  itemHeaders: HttpHeaders | Record<string, string | string[]>;
  showFacetsIfNoResults: boolean;
  showLabel: boolean;
  allowEmptySearch: boolean;
  aggregationsName: Record<string, string>;
  // to get the order of the aggregations from the backend, use a resolve in the route config
  aggregationsOrder: string[];
  // remove a call and use a resolve in the route config
  aggregationsExpand: string[] | (() => string[]);
  aggregationsHide: string[];
  aggregationsBucketSize: number;
  processAggregations: (aggregations: Aggregation[]) => Observable<Aggregation[]>;
  searchFields: SearchField[];
  resultsText: ((hits: EsResult['hits']) => string) | null;
  pagination: {
    boundaryLinks: boolean;
    maxSize: number;
    pageReport: boolean;
    rowsPerPageOptions: number[];
  };
  sortOptions: SortOption[];
  formFieldMap: (field: FormlyFieldConfig, jsonSchema: JSONSchema7) => FormlyFieldConfig;
  hideInTabs: boolean;
  preCreateRecord: (record: TMetadata) => TMetadata;
  preUpdateRecord: (record: TMetadata) => TMetadata;
  postprocessRecordEditor: (record: TMetadata) => TMetadata;
  preprocessRecordEditor: (record: TMetadata) => TMetadata;
  redirectUrl: (record: RecordData<TMetadata>, action: string) => Observable<string>;
  deleteMessage: (pid: string) => string[];
  searchFilters: SearchFilter[];
}
