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
import { Component, computed, inject, input, output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface IFilter {
  key: string;
  aggregationKey: string;
  name?: string;
}

export interface IBucket {
  key: string | number;
  aggregationKey?: string;
  name?: string;
  buckets?: IBucket[];
  value?: { buckets: IBucket[] };
  doc_count?: number;         
  indeterminate?: boolean;   
  bucketSize?: number;        

  [key: string]: unknown;     
}

@Component({
    selector: 'ng-core-list-filters',
    templateUrl: './list-filters.component.html',
    standalone: false
})
export class ListFiltersComponent {

  protected translateService: TranslateService = inject(TranslateService);

    /** All aggregations */
  aggregations = input<IBucket[]>([]);

  /** Selected aggregations filters */
  aggregationsFilters = input<IBucket[]>([]);

  /** Search filters */
  searchFilters = input<IBucket[]>([]);

  /** Remove filter event */
  remove = output<IFilter>();

  /** Filters to hide */
  filtersToHide = ['simple'];

  /** Filters selected */
  filters = computed(() => this.getActiveFilters());

  /**
   * Returns promised filters
   * @returns the array of IFilter
   */
  private getActiveFilters(): IFilter[] {
    const filterSet = [];
      this.searchFilters()?.forEach(filter => {
      if (!filter.filters) {
        filterSet.push(filter.filter as string);
      } else {
        (filter.filters as IBucket[]).forEach(fSection => {
          filterSet.push(fSection.filter as string);
        });
      }
    });
    this.filtersToHide = [...new Set<string>([...this.filtersToHide, ...filterSet])];

    const filters = [];
   this.aggregationsFilters()?.forEach(filter => {
      if (!this.filtersToHide.includes(filter.key)) {
        (filter.value as string[]).forEach(value => {
          if (value.includes('--')) {
            const regex = /\d{13,}--\d{13,}/;
            if (regex.test(value)) {
              const [min, max] = value.split('--');
              const dateMin = new Intl.DateTimeFormat(this.translateService.currentLang).format(+min);
              const dateMax = new Intl.DateTimeFormat(this.translateService.currentLang).format(+max);
              filters.push({ key: value, aggregationKey: filter.key, name: `${dateMin} - ${dateMax}` });
            } else {
              filters.push({ key: value, aggregationKey: filter.key, name: value.replace('--', ' - ') });
            }
          } else {
            filters.push({ key: value, aggregationKey: filter.key });
          }
        });
      }
    });
    this.aggregations()?.forEach(item => {
      this.getFilterNames(item.value?.buckets || [], filters);
    });

    return filters;
  }

  /**
   * Get displayed name of bucket
   * and fill in filters list.
   *
   * @param buckets - Bucket to get the name from.
   */
    private getFilterNames(buckets: IBucket[], filters: IFilter[]): void {
    if (!buckets || buckets.length === 0) {
      return;
    }

    buckets.forEach(bucket => {
      for (const k in bucket) {
        const subBucket = bucket[k];
        if (subBucket && typeof subBucket === 'object' && (subBucket as IBucket).buckets) {
          this.getFilterNames((subBucket as IBucket).buckets!, filters);
        }
      }

      if (bucket.name) {
        const index = filters.findIndex(f => f.key === bucket.key && f.aggregationKey === bucket.aggregationKey);
        if (index > -1) {
          filters[index].name = bucket.name;
          filters[index] = { ...filters[index] };
        }
      }
    });
  }
  /**
   * Remove filter.
   * @param filter - the filter to remove
   */
  removeFilter(filter: IFilter): void {
    this.remove.emit(filter);
  }
}
