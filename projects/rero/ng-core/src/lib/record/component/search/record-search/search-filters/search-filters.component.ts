// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToggleSwitch, ToggleSwitchChangeEvent } from 'primeng/toggleswitch';
import { SearchFilter, SearchFilterSection } from '../../../../../model';
import { RecordSearchStore } from '../../store/record-search.store';

@Component({
  selector: 'ng-core-search-filters',
  templateUrl: './search-filters.component.html',
  imports: [NgClass, NgTemplateOutlet, ToggleSwitch, FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFiltersComponent {
  protected store = inject(RecordSearchStore);

  // Class for section (layout customization, provided by parent)
  styleClassSection = input<string>();

  protected readonly allSearchFilters = computed(
    () => this.store.config().searchFilters as (SearchFilter | SearchFilterSection)[],
  );

  protected isSection(item: SearchFilter | SearchFilterSection): item is SearchFilterSection {
    return 'filters' in item;
  }

  protected asSection(item: SearchFilter | SearchFilterSection): SearchFilterSection {
    return item as SearchFilterSection;
  }

  /**
   * Check if a filter section should be displayed
   * @param searchFilterSection - SearchFilterSection
   * @returns True if the section should be shown
   */
  showFilterSection(searchFilterSection: SearchFilterSection): boolean {
    return searchFilterSection.filters.some((filter: SearchFilter) =>
      this.store.config().allowEmptySearch
        ? true
        : (this.store.q() && filter.showIfQuery === true) || !filter?.showIfQuery,
    );
  }

  /**
   * Check if a simple filter should be displayed
   * @param searchFilter - SearchFilter
   * @returns True if the filter should be shown
   */
  showFilter(searchFilter: SearchFilter): boolean {
    if (this.store.config().allowEmptySearch) {
      return true;
    }
    if (!this.store.q()) {
      return !(searchFilter.showIfQuery === true);
    } else {
      return searchFilter.showIfQuery === true || !searchFilter?.showIfQuery;
    }
  }

  /**
   * Activates the filter according to the store aggregations filters (signal-based).
   * @param filter - SearchFilter
   * @returns True, if the filter is active.
   */
  isChecked(filter: SearchFilter): boolean {
    const entry = this.store.aggregationsFilters().find((f) => f.key === filter.filter);
    if (!entry || entry.values.length === 0) {
      return false;
    }
    const value = entry.values[0];
    if (filter.filter === 'simple') {
      return !JSON.parse(value);
    }
    return Boolean(JSON.parse(value));
  }

  /**
   * Event on switch — updates the store directly
   * @param event - ToggleSwitchChangeEvent primeng
   * @param filter the search filter
   */
  change(event: ToggleSwitchChangeEvent, filter: SearchFilter): void {
    const values: string[] = [];
    if (filter.filter === 'simple') {
      values.push(event.checked ? '0' : '1');
    } else if (event.checked) {
      values.push(String(event.checked));
    }
    this.store.updateAggregationsFilter(filter.filter, values);
  }
}
