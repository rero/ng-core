/*
 * RERO angular core
 * Copyright (C) 2022 RERO
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
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RecordSearchService } from '../../record-search.service';

@Component({
  selector: 'ng-core-list-filters',
  templateUrl: './list-filters.component.html'
})
export class ListFiltersComponent implements OnChanges {
  /**
   * All aggregations
   */
  @Input() aggregations: any;

  /**
   * Selected aggregations filters
   */
  @Input() aggregationsFilters: any;

  /**
   * Search filters
   */
   @Input() searchFilters: any;

  /**
   * List of selected filters
   */
  filters: Array<any>;

  /**
   * Filters to hide
   */
  filtersToHide = [];

  /**
   * Constructor.
   *
   * @param _recordSearchService - RecordSearch service.
   * @param _ref - ChangeDetectorRef.
   */
  constructor(
    private _recordSearchService: RecordSearchService,
    private _ref: ChangeDetectorRef
  ){ }

  /**
   * Update list of filters on changes.
   *
   * @param changes - SimpleChanges.
   */
  ngOnChanges(changes: SimpleChanges): void {
    // hide searchFilters from list of filters
    this.filtersToHide = this.searchFilters.map(filter => filter.filter);

    if (changes?.aggregationsFilters) {
      this._ref.detach();
      this.filters = [];

      changes.aggregationsFilters.currentValue.map((filter: any) => {
        if (!this.filtersToHide.includes(filter.key)) {
          this.filters = this.filters.concat(
            filter.values.map((value: any) => {
              return { key: value, aggregationKey: filter.key };
            })
          );
        }
      });
    }

    if (changes?.aggregations) {
      changes.aggregations.currentValue.map((item: any) => {
          this.getFilterNames(item.value.buckets);
      });

      this._ref.reattach();
    }

  }

  /**
   * Get displayed name of bucket
   * and fill in filters list.
   *
   * @param buckets - Bucket to get the name from.
   */
  getFilterNames(buckets: any) {
    if (buckets.length === 0) {
      return;
    }

    buckets.map((bucket: any) => {
      for (const k in bucket) {
        if (bucket[k].buckets) {
          this.getFilterNames(bucket[k].buckets);
        }
      }
      if (bucket.name) {
        const index = this.filters.findIndex((filter: any) => filter.key === bucket.key && filter.aggregationKey === bucket.aggregationKey);
        if (index > -1) {
          this.filters[index].name = bucket.name;
          this.filters[index] = {...this.filters[index]};
        }
      }
    });
  }

  /**
   * Remove filter.
   *
   * @param filter - the filter to remove
   */
  remove(filter: any): void {
    this._recordSearchService.removeFilter(filter.aggregationKey, filter.key, true);
  }
}
