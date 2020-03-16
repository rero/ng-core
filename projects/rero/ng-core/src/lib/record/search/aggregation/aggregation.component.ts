/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ng-core-record-search-aggregation',
  templateUrl: './aggregation.component.html',
})
export class RecordSearchAggregationComponent {
  /**
   * Aggregation data
   */
  @Input()
  public aggregation: { key: string, bucketSize: any, value: { buckets: {}[] } };

  @Input()
  public aggregationFilters = [];

  /**
   * Show or hide filter items
   */
  @Input()
  public expand = true;

  /**
   * Emit event to parent when a value is clicked
   */
  @Output()
  public updateAggregationFilter = new EventEmitter<{ term: string, values: string[] }>();

  /**
   * Show filter values
   * @return boolean
   */
  showAggregation() {
    // return this.expand || this.selectedValues.length > 0;
    return this.expand;
  }

  /** Emit aggregation filter update to parent component */
  emitAggregationFilterUpdate(event: { term: string, values: string[] }) {
    this.updateAggregationFilter.emit({ term: event.term, values: event.values });
  }
}
