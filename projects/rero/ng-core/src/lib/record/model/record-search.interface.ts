// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { HttpHeaders } from '@angular/common/http';
import { Type } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { EditorSettingsConfig } from '../editor/component/editor/editor.component';
import { IFilter } from '../component/search/record-search/aggregation/list-filters/list-filters.component';
import { JSONSchema7 } from '../editor/utils/utils';
import { Observable } from 'rxjs';
import {
  ActionStatus,
  Bucket,
  EsResult,
  JsonObject,
  RecordData,
  SearchField,
  SearchFilter,
  SearchFilterSection
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
  defaultQuery?: boolean;
  defaultNoQuery?: boolean;
  icon?: string;
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
  detailComponent?: Type<unknown>;
  canAdd: () => Observable<ActionStatus>;
  canUpdate: ((record: RecordData<TMetadata>) => Observable<ActionStatus>) | null;
  canDelete: ((record: RecordData<TMetadata>) => Observable<ActionStatus>) | null;
  canRead: ((record: RecordData<TMetadata>) => Observable<ActionStatus>) | null;
  canUse: ((record: RecordData<TMetadata>) => Observable<ActionStatus>) | null;
  permissions: (record: RecordData<TMetadata>) => Observable<Record<string, ActionStatus>>;
  processBucketName: null | ((bucket: Bucket) => Observable<string>);
  processFilterName: null | ((filter: IFilter) => Observable<string>);
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
  deleteMessage: ((pid: string) => string[]) | null;
  searchFilters: (SearchFilter | SearchFilterSection)[];
  editorSettings: EditorSettingsConfig;
}
