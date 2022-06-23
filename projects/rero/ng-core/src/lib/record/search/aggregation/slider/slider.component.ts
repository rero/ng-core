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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RecordSearchService } from '../../record-search.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ng-core-aggregation-slider',
  templateUrl: './slider.component.html',
})
export class AggregationSliderComponent implements OnDestroy, OnInit {
  // Aggregation key.
  @Input()
  key: string;

  // Buckets list
  @Input()
  buckets: Array<any>;

  // Min value.
  @Input()
  min = 1;

  // Max value.
  @Input()
  max = 1000;

  // Step
  @Input()
  step = 1;

  // Range to search
  range: Array<number> = null;

  // True if route have aggregation query param.
  hasQueryParam = false;

  // Subscription to search service.
  private _searchServiceSubscription: Subscription;

  /**
   * Constructor.
   *
   * @param _recordSearchService Record search service.
   */
  constructor(private _recordSearchService: RecordSearchService) {}

  /**
   * Component initialization.
   *
   * Subscribe to route changes for getting aggregation query parameter.
   */
  ngOnInit() {
    this.range = [this.min, this.max];

    this._searchServiceSubscription = this._recordSearchService.aggregationsFilters.subscribe((filters: any) => {
      if (!filters) {
        return;
      }

      let filter = filters.find((element: any) => element.key === this.key);

      if (filter) {
        filter = filter.values[0].split('--').map((item: string) => {
          return +item;
        });

        this.hasQueryParam = true;
        this.range = filter;
      } else {
        this.range = [this.min, this.max];
      }
    });
  }

  /**
   * Component destruction.
   *
   * Unsubsribes from search service.
   */
  ngOnDestroy() {
    this._searchServiceSubscription.unsubscribe();
  }

  /**
   * Update aggregation filter.
   */
  updateFilter() {
    if (!this.range[0] || this.range[0] < this.min) { this.range[0] = this.min; }
    if (!this.range[1] || this.range[1] > this.max) { this.range[1] = this.max; }

    this._recordSearchService.updateAggregationFilter(this.key, [
      `${this.range[0]}--${this.range[1]}`,
    ]);
  }

  /**
   * Clear aggregation filter.
   */
  clearFilter() {
    this._recordSearchService.updateAggregationFilter(this.key, []);
  }
}
