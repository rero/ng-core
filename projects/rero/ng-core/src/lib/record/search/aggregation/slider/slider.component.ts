/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
  selector: 'ng-core-aggregation-slider',
  templateUrl: './slider.component.html'
})
export class AggregationSliderComponent implements OnDestroy, OnInit {

  protected recordSearchService: RecordSearchService = inject(RecordSearchService);

  // COMPONENT ATTRIBUTES =====================================================
  /** The aggregation key. */
  key = input<string>();
  /** Buckets list */
  buckets = input<any[]>();
  /** The minimum value */
  min = input<number>(1);
  /** The maximum value */
  max = input<number>(1000);
  /** gap between each value. */
  step = input<number>(1);

  /** Range to search */
  range: Array<number> = null;
  /** True if route have aggregation query param. */
  hasQueryParam = false;

  /** Subscription to search service. */
  private searchServiceSubscription: Subscription;

  /**
   * OnInit hook
   * Subscribe to route changes for getting aggregation query parameter.
   */
  ngOnInit() {
    this.range = [this.min(), this.max()];
    this.searchServiceSubscription = this.recordSearchService
        .aggregationsFilters
        .subscribe((filters: any) => {
          if (!filters) {
            return;
          }
          let filter = filters.find((element: any) => element.key === this.key);
          if (filter) {
            filter = filter.values[0].split('--').map((item: string) => +item);
            this.hasQueryParam = true;
            this.range = filter;
          } else {
            this.range = [this.min(), this.max()];
          }
        });
  }

  /**
   * OnDestroy hook
   * Unsubscribes from search service.
   */
  ngOnDestroy() {
    this.searchServiceSubscription.unsubscribe();
  }

  // COMPONENT FUNCTIONS ======================================================
  /** Update aggregation filter. */
  updateFilter() {
    if (!this.range[0] || this.range[0] < this.min()) { this.range[0] = this.min(); }
    if (!this.range[1] || this.range[1] > this.max()) { this.range[1] = this.max(); }
    this.recordSearchService.updateAggregationFilter(this.key(), [
      `${this.range[0]}--${this.range[1]}`,
    ]);
  }

  /** Clear aggregation filter. */
  clearFilter() {
    this.hasQueryParam = false;
    this.recordSearchService.updateAggregationFilter(this.key(), []);
  }
}
