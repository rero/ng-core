/*
 * RERO angular core
 * Copyright (C) 2022-2024 RERO
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
import { TranslateService } from '@ngx-translate/core';
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
  filtersToHide = ['simple'];

  /**
   * Constructor.
   *
   * @param recordSearchService - RecordSearch service.
   * @param ref - ChangeDetectorRef.
   * @param translateService - TranslateService.
   */
  constructor(
    private recordSearchService: RecordSearchService,
    private ref: ChangeDetectorRef,
    private translateService: TranslateService
  ){ }

  /**
   * Update list of filters on changes.
   *
   * @param changes - SimpleChanges.
   */
  ngOnChanges(changes: SimpleChanges): void {
    // hide searchFilters defined on route config from list of filters
    const filterSet = [];
    this.searchFilters.forEach((filter: any) => {
      if (!filter.filters) {
        filterSet.push(filter.filter);
      } else {
        filter.filters.forEach((fSection: any) => {
          filterSet.push(fSection.filter);
        });
      }
    });
    this.filtersToHide = [...new Set<string>([...this.filtersToHide, ...filterSet])];

    if (changes?.aggregationsFilters) {
      this.ref.detach();
      this.filters = [];

      changes.aggregationsFilters.currentValue.map((filter: any) => {
        if (!this.filtersToHide.includes(filter.key)) {
          this.filters = this.filters.concat(
            filter.values.map((value: any) => {
              const data = { key: value, aggregationKey: filter.key };
              // Check if value is a range of dates
              const regex = /\d{13,}--\d{13,}/;
              if (regex.test(value)) {
                const nameKey = 'name';
                const [min, max] = value.split('--');
                const dateMin = new Intl.DateTimeFormat(this.translateService.currentLang).format(min);
                const dateMax = new Intl.DateTimeFormat(this.translateService.currentLang).format(max);
                data[nameKey] = `${dateMin} - ${dateMax}`;
              }
              return data;
            })
          );
        }
      });
    }

    if (changes?.aggregations) {
      changes.aggregations.currentValue.map((item: any) => {
          this.getFilterNames(item.value.buckets);
      });

      this.ref.reattach();
    }

  }

  /**
   * Get displayed name of bucket
   * and fill in filters list.
   *
   * @param buckets - Bucket to get the name from.
   */
  getFilterNames(buckets: any) {
    if (!buckets || buckets.length === 0) {
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
    this.recordSearchService.removeFilter(filter.aggregationKey, filter.key, true);
  }
}
