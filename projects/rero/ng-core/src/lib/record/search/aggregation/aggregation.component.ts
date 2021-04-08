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
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ng-core-record-search-aggregation',
  templateUrl: './aggregation.component.html',
})
export class RecordSearchAggregationComponent {
  /** Aggregation data */
  @Input() aggregation: {
    key: string,
    bucketSize: any,
    doc_count?: number,
    value: { buckets: Array<any> },
    type: string,
    config?: any,
    name?: string
  };
  /** Current selected values */
  @Input() aggregationsFilters = [];
  /** If true, by default buckets are displayed. */
  @Input() expand = true;

  /**
   * Returns aggregations filters corresponding to the aggregation key.
   * @return List of aggregation filters
   */
  get aggregationFilters(): Array<string> {
    const aggregationFilters = this.aggregationsFilters.find((item: any) => item.key === this.aggregation.key);
    return (aggregationFilters === undefined)
      ? []
      : aggregationFilters.values;
  }

  /**
   * Display buckets for the aggregation or not.
   * @return Boolean
   */
  showAggregation(): boolean {
    return this.expand || this.aggregationFilters.length > 0;
  }
}
