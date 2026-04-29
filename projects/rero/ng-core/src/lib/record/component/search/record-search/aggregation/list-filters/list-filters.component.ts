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
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Bucket } from '../../../../../../model';
import { RecordSearchStore } from '../../../store/record-search.store';
import { Observable, of, shareReplay } from 'rxjs';

export interface IFilter {
  key: string;
  aggregationKey: string;
  name?: string;
  label$?: Observable<string>;
}

@Component({
  selector: 'ng-core-list-filters',
  templateUrl: './list-filters.component.html',
  imports: [Button, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFiltersComponent {
  protected translateService: TranslateService = inject(TranslateService);
  protected store = inject(RecordSearchStore);

  // Filters to hide
  filtersToHide = ['simple'];

  // Filters selected
  filters = computed(() => this.getActiveFilters());


  /**
   * Returns promised filters
   * @returns the array of IFilter
   */
  private getActiveFilters(): IFilter[] {
    const filterSet: string[] = [];
    this.store.config().searchFilters.forEach((filter: any) => {
      if (!filter.filters) {
        filterSet.push(filter.filter);
      } else {
        filter.filters.forEach((fSection: any) => {
          filterSet.push(fSection.filter);
        });
      }
    });
    this.filtersToHide = [...new Set<string>([...this.filtersToHide, ...filterSet])];

    const filters: IFilter[] = [];
    this.store.aggregationsFilters().map((filter: any) => {
      if (!this.filtersToHide.includes(filter.key)) {
        filter.values.map((value: string) => {
          if (value.includes('--')) {
            const regex = /\d{13,}--\d{13,}/;
            if (regex.test(value)) {
              const [min, max] = value.split('--');
              const dateMin = new Intl.DateTimeFormat(this.translateService.getCurrentLang()).format(+min);
              const dateMax = new Intl.DateTimeFormat(this.translateService.getCurrentLang()).format(+max);
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
    const aggregations = this.store.aggregations();
    if (aggregations) {
      aggregations.map((item: any) => {
        this.getFilterNames(item.value.buckets, filters);
      });
    }
    const processFn = this.store.config().processFilterName;
    filters.forEach((filter) => {
      if (!filter.label$) {
        filter.label$ = (processFn
          ? processFn(filter).pipe(shareReplay(1))
          : filter.name
            ? of(filter.name)
            : this.translateService.stream(filter.key)) as Observable<string>;
      }
    });

    return filters;
  }

  /**
   * Get displayed name of bucket
   * and fill in filters list.
   *
   * @param buckets - Bucket to get the name from.
   */
  getFilterNames(buckets: Bucket[], filters: IFilter[]) {
    if (!buckets || buckets.length === 0) {
      return;
    }
    buckets.map((bucket: any) => {
      for (const k in bucket) {
        if (bucket[k].buckets) {
          this.getFilterNames(bucket[k].buckets, filters);
        }
      }
      const index = filters.findIndex(
        (filter: any) => filter.key === bucket.key && filter.aggregationKey === bucket.aggregationKey,
      );
      if (index > -1) {
        if (bucket.name) {
          filters[index].name = bucket.name;
        }
        // Reuse bucket.label$ (stable Observable) to avoid re-subscription on re-renders
        if (bucket.label$) {
          filters[index].label$ = bucket.label$;
        }
        filters[index] = { ...filters[index] };
      }
    });
  }

  /**
   * Remove filter.
   * @param filter - the filter to remove
   */
  removeFilter(filter: IFilter): void {
    this.store.removeFilterValue(filter.aggregationKey, filter.key);
  }
}
