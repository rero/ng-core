/*
 * RERO angular core
 * Copyright (C) 2021-2024 RERO
 * Copyright (C) 2021 UCLouvain
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
import { Component, OnDestroy, OnInit, inject, input } from '@angular/core';
import { Subscription } from 'rxjs';
import { RecordSearchService } from '../../record-search.service';

@Component({
  selector: 'ng-core-aggregation-date-range',
  templateUrl: './date-range.component.html'
})
export class AggregationDateRangeComponent implements OnInit, OnDestroy {

  protected recordSearchService: RecordSearchService = inject(RecordSearchService);

  // COMPONENTS ATTRIBUTES ====================================================
  // Buckets list
  buckets = input.required<any[]>();
  // Aggregation key
  key = input.required<string>();
  // Components configuration
  config = input.required<any>();

  // Model used for Datepicker field.
  dateRangeModel: Date[] | undefined;
  // Date minimum
  minDate: any = null;
  // Date maximum
  maxDate: any = null;

  /** True if route have aggregation query param. */
  hasQueryParam = false;

  /** Subscription to search service. */
  private searchServiceSubscription: Subscription;

  /** OnInit hook */
  ngOnInit(): void {
    // Define min/max values if not exists
    if (this.config().min && this.config().min !== null) {
      this.minDate = new Date(this.config().min);
    }
    if (this.config().max && this.config().max !== null) {
      this.maxDate = new Date(this.config().max);
    }

    this.searchServiceSubscription = this.recordSearchService.aggregationsFilters.subscribe((filters: any) => {
      if (!filters) {
        return;
      }
      const filter = filters.find((element: any) => element.key === this.key());
      this.hasQueryParam = filter !== undefined;
      this.dateRangeModel = (filter)
        ? filter.values[0].split('--').map((item: string) => new Date(+item))  // split filter data and transform each part into Date
        : [];
    });
  }

  /** OnDestroy hook */
  ngOnDestroy(): void {
    this.searchServiceSubscription.unsubscribe();
  }

  // COMPONENTS FUNCTIONS =====================================================
  /** Update aggregation filter. */
  updateFilter() {
    if (this.dateRangeModel && this.dateRangeModel[0] && this.dateRangeModel[1]) {
      this.recordSearchService.updateAggregationFilter(this.key(), [
          `${this.dateRangeModel[0].getTime()}--${this.dateRangeModel[1].getTime()}`
      ]);
    }
  }

  /** Clear aggregation filter. */
  clearFilter() {
    this.recordSearchService.updateAggregationFilter(this.key(), []);
  }
}
