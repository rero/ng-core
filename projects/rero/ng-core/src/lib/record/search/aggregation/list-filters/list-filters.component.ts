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

@Component({
  selector: 'ng-core-list-filters',
  templateUrl: './list-filters.component.html',
})
export class ListFiltersComponent {
  // Inject
  protected translateService: TranslateService = inject(TranslateService);

  // Selected aggregations filters
  aggregationsFilters = input<any>();

  // Search filters
  searchFilters = input<any[]>([]);

  /** Remove filter event */
  remove = output<IFilter>();

  // Filters to hide
  filtersToHide = ['simple'];

  // Filters selected
  filters = computed(() => this.getActiveFilters());

  /**
   * Returns promised filters
   * @returns the array of IFilter
   */
  private getActiveFilters(): IFilter[] {
    const filterSet = [];
    this.searchFilters().forEach((filter: any) => {
      if (!filter.filters) {
        filterSet.push(filter.filter);
      } else {
        filter.filters.forEach((fSection: any) => {
          filterSet.push(fSection.filter);
        });
      }
    });
    this.filtersToHide = [...new Set<string>([...this.filtersToHide, ...filterSet])];

    let filters = [];
    this.aggregationsFilters().map((filter: any) => {
      if (!this.filtersToHide.includes(filter.key)) {
        filter.values.map((value: string) => {
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

    return filters;
  }

  /**
   * Remove filter.
   * @param filter - the filter to remove
   */
  removeFilter(filter: IFilter): void {
    this.remove.emit(filter);
  }
}
