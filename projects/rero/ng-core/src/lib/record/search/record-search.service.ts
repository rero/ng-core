/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interface representing aggregations filters
 */
export interface AggregationsFilter {
  key: string;
  values: Array<any>;
}

/**
 * Service for managing records search.
 */
@Injectable({
  providedIn: 'root',
})
export class RecordSearchService {
  /** Aggregations filters array */
  private _aggregationsFilters: Array<AggregationsFilter> = null;

  /** Aggregations filters subject */
  private _aggregationsFiltersSubject: BehaviorSubject<Array<AggregationsFilter>>;

  /**
   * Constructor, initialize aggregations filters subject.
   */
  constructor() {
    this._aggregationsFiltersSubject = new BehaviorSubject(this._aggregationsFilters);
  }

  /**
   * Returns an observable which emits aggregations filters.
   */
  get aggregationsFilters(): Observable<Array<AggregationsFilter>> {
    return this._aggregationsFiltersSubject.asObservable();
  }

  /**
   * Removes the given value from selected filters and removes all children
   * selected values, too.
   * @param key Aggregation key
   * @param bucket Bucket containing the value to remove
   */
  removeAggregationFilter(key: string, bucket: any) {
    this.removeFilter(key, bucket.key);
    this.removeChildrenFilters(bucket);
    this.removeParentFilters(bucket);
    // Update selected aggregations filters
    this._aggregationsFiltersSubject.next(cloneDeep(this._aggregationsFilters));
  }

  /**
   * Set all aggregations filters and emit the list.
   * @param aggregationsFilters List of aggregations filters
   * @param forceRefresh Force the refresh of aggregations filters
   */
  setAggregationsFilters(aggregationsFilters: Array<AggregationsFilter>, forceRefresh: boolean = false) {
    // TODO: If the filter is in a child bucket, checks if all parents are
    // selected, too. If not, adds all parents filters.
    if (!forceRefresh && JSON.stringify(this._aggregationsFilters) !== JSON.stringify(aggregationsFilters)) {
      forceRefresh = true;
    }

    if (forceRefresh) {
      this._aggregationsFilters = cloneDeep(aggregationsFilters);
      this._aggregationsFiltersSubject.next(cloneDeep(this._aggregationsFilters));
    }
  }

  /**
   * Stores selected values for an aggregation or removes it if values are empty.
   * @param term Term (aggregation key)
   * @param values Selected values
   */
  updateAggregationFilter(term: string, values: string[], bucket: any = null) {
    if (this._aggregationsFilters === null) {
      this._aggregationsFilters = [];
    }

    if (bucket) {
      this.removeParentFilters(bucket);
      this.removeChildrenFilters(bucket);
    }

    if (values.length === 0) {
      // no more items selected, remove filter
      this._aggregationsFilters = this._aggregationsFilters.filter(item => item.key !== term);
    } else {
      const filter = this._aggregationsFilters.find(item => item.key === term);
      // In both cases values are affected with destructuring assignment, to
      // avoid values to be modified outside the service, as array are assigned
      // by reference.
      if (filter) {
        // update existing filter
        filter.values = [...values];
      } else {
        // add new filter
        this._aggregationsFilters.push({ key: term, values: [...values] });
      }
    }

    this._aggregationsFiltersSubject.next(cloneDeep(this._aggregationsFilters));
  }

  /**
   * Remove a filter from the current aggregations filters.
   * @param key filter name
   * @param value filter value
   */
  removeFilter(key, value) {
    const filter = this._aggregationsFilters.find(item => item.key === key);
    if (filter) {
      filter.values = filter.values.filter(item => item !== value);
      // No more selected values, remove key from aggregations filters.
      if (filter.values.length === 0) {
        this._aggregationsFilters = this._aggregationsFilters.filter(item => item.key !== filter.key);
      }
    }
  }

  /**
   * Check if a given filter exist in the current aggregations filters.
   * @param key filter name
   * @param value filter value
   * @returns true if exists
   */
   hasFilter(key, value): boolean {
    const filter = this._aggregationsFilters.find((a) => a.key === key);
    return !!(filter && filter.values.some((v) => v === value));
  }

  /**
   * Remove the parent filters of a given bucket.
   * @param bucket elasticseach bucket
   */
  removeParentFilters(bucket) {
    if (bucket.parent) {
      this.removeParentFilters(bucket.parent);
    }
    this.removeFilter(bucket.aggregationKey, bucket.key);
  }

  /**
   * Removes children filters of a given bucket.
   * @param bucket elatic bucket
   */
  removeChildrenFilters(bucket) {
    for (const k of Object.keys(bucket).filter(key => bucket[key].buckets)) {
      const aggregationsKey = k;
      for (const childBucket of bucket[k].buckets) {
        this.removeFilter(aggregationsKey, childBucket.key);
        this.removeChildrenFilters(childBucket);
      }
    }
  }

  /**
   * Check if a children filter of a given bucket exists
   * @param bucket elasticsearch bucket
   * @returns true if has childre with a corresponding filter
   */
  hasChildrenFilter(bucket) {
    for (const k of Object.keys(bucket).filter(key => bucket[key].buckets)) {
      const aggregationsKey = k;
      for (const childBucket of bucket[k].buckets) {
        const filter = this._aggregationsFilters.find((v) => v.key === aggregationsKey);
        if ((filter && filter.values.includes(childBucket.key)) || this.hasChildrenFilter(childBucket)) {
          return true;
        }
      }
    }
    return false;
  }
}
