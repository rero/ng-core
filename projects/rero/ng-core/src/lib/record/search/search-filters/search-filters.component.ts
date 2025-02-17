/*
 * RERO angular core
 * Copyright (C) 2024 RERO
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
import { Component, inject, input, output } from '@angular/core';
import { SearchFilter, SearchFilterSection } from '../../record';
import { ToggleSwitchChangeEvent } from 'primeng/toggleswitch';
import { ActivatedRoute } from '@angular/router';

export interface IChecked {
  filterKey: string;
  checked: boolean;
}

@Component({
    selector: 'ng-core-search-filters',
    templateUrl: './search-filters.component.html',
    standalone: false
})
export class SearchFiltersComponent {

  protected activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  // Array of filters
  searchFilters = input<SearchFilter[]|SearchFilterSection[]>([]);

  // Resources configuration
  config = input.required<any>();

  // query string
  query = input.required<string>();

  // Class for section
  styleClassSection = input<string>();

  // Filter event
  onChange = output<IChecked>();

  /**
   * Check if a filter section
   * @param searchFilterSection - SearchFilterSection
   * @returns True if the filter is the section
   */
  showFilterSection(searchFilterSection: SearchFilterSection): boolean {
    return searchFilterSection.filters.some((filter: SearchFilter) => this.config().allowEmptySearch
        ? true
        : (this.query() && filter.showIfQuery === true) || !filter?.showIfQuery
    );
  }

  /**
   * Check if a simple filter
   * @param searchFilter - SearchFilter
   * @returns True if the filter is simple.
   */
  showFilter(searchFilter: SearchFilter): boolean {
    if (this.config().allowEmptySearch) {
      return true;
    }
    if (!this.query()) {
      return !(searchFilter.showIfQuery === true);
    } else {
      return (searchFilter.showIfQuery === true || !searchFilter?.showIfQuery);
    }
  }

  /**
   * Activates the filter according to the route parameters.
   * @param filter - SearchFilter
   * @returns True, if the parameter is present nd contains a value.
   */
  isChecked(filter: SearchFilter): boolean {
    if (this.activatedRoute.snapshot.queryParamMap.has(filter.filter)) {
      const value = this.activatedRoute.snapshot.queryParamMap.get(filter.filter);
      if (!value) {
        return false;
      }
      if (filter.filter === 'simple') {
        return !Boolean(JSON.parse(value));
      } else {
        return Boolean(JSON.parse(value));
      }
    }

    return false;
  }

  /**
   * Event on switch
   * @param event - ToggleSwitchChangeEvent primeng
   * @param filter the search filter
   */
  change(event: ToggleSwitchChangeEvent, filter: SearchFilter): void {
    this.onChange.emit({ filterKey: filter.filter, checked: event.checked })
  }
}
