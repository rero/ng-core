/*
 * RERO angular core
 * Copyright (C) 2020-2023 RERO
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

/**
 * Class representing a record set returned by API.
 */
export class Record {
  aggregations: Record<string, Aggregation> | null;
  id?: string;
  hits: SearchResult[] | null;
  links: Record<string, string> | null;
}

export class SearchResult {
  type: string;
  records: Record;
}

export interface File {
  updated: string;
  size: string;
  url?: string;
  mimetype: string;
  version_id: string;
  is_head: boolean;
  created: string;
  tags: string[];
  delete_marker: boolean;
  links: {
    self: string,
    version?: string,
    uploads?: string,
    commit?: string,
    content?: string
  };
  checksum: string;
  key: string;
  showInfo: boolean;
  showChildren: boolean;
  metadata: Record<string, unknown>;
}

/**
 * Interface representing a search property, on which we can do a specific search
 * with query string like: `q=title:query`.
 */
export interface SearchField {
  label: string;
  path: string;
  selected?: boolean;
}

/** Interface representing a search filter */
export interface SearchFilter {
  filter: string;
  label: string;
  value: string;
  /* Display filter only if there is a query.
  This is overridden by the allowEmptySearch parameter
  in the resource configuration. */
  showIfQuery?: boolean;
  /* If you set this value, the url parameter will still be present,
  but with different values */
  disabledValue?: string;
  persistent?: boolean;
  url?: {
    external?: boolean;
    link?: string;
    routerLink?: string[];
    target?: string;
    title?: string;
  };
}

/**
 * Interface representing a collection of SearchFilters with label.
 * The label adds a title to the interface.
 *
 * Example on the interface:
 *
 * Show only (label):
 * Filter 1
 * Filter 2
 * etc…
 */
export interface SearchFilterSection {
  label: string;
  filters: SearchFilter[];
}

/** Interfaces for an aggregation */
export interface Aggregation {
  key: string;
  bucketSize: number;
  value: { buckets: AggregationBucket[] };
  expanded: boolean;
  loaded?: boolean;
  doc_count?: number;
  type?: string;
  config?: AggregationConfig;
  name?: string;
}

/**
 * Interface to describe an aggregation configuration
 *
 * Additionally to aggregation buckets, an aggregation configuration object could be
 * provided to control the aggregation display behavior. The configuration keys depends
 * on the aggregation type.
 *
 * attributes are :
 *   @attribute type - string: the type of aggregation (ex date-range, sum, date-histogram, ...)
 *   @attribute min - number: the minimum value into the aggregation buckets.
 *   @attribute max - number: the maximum value into the aggregation buckets.
 *   @attribute step - number: the step uses between to value.
 *   @attributes any additional/not known attributes.
 */
export interface AggregationConfig {
  type?: string,
  min?: number,
  max?: number,
  step?: number
  [x: string | number | symbol]: unknown  // allow additional properties
}
