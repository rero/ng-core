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
import { Component, input, output } from '@angular/core';
import { Aggregation } from '../../record';

@Component({
    selector: 'ng-core-record-search-aggregation',
    templateUrl: './aggregation.component.html',
    standalone: false
})
export class RecordSearchAggregationComponent {
  // COMPONENT ATTRIBUTES =====================================================
  /** Aggregation data */
  aggregation = input<Aggregation>();
  /** Current selected values */
  aggregationsFilters = input.required<any[]>();
  /** Output event when aggregation is clicked. */
  aggregationClicked = output<{ key: string, expanded: boolean }>();

  // GETTER & SETTER ==========================================================
  /**
   * Returns aggregations filters corresponding to the aggregation key.
   * @return List of aggregation filters
   */
  get aggregationFilters(): Array<string> {
    const aggregationFilters = this.aggregationsFilters().find((item: any) => item.key === this.aggregation().key);
    return aggregationFilters === undefined ? [] : aggregationFilters.values;
  }

  /** Is the aggregation content should be displayed. */
  get isAggregationDisplayed(): boolean {
    return this.aggregation().expanded || this.aggregationFilters.length > 0;
  }

  // PUBLIC COMPONENTS ========================================================

  /**
   * Method called when the title of an aggregation is clicked.
   */
  toggleVisibility(): void {
    // if filters are selected, we do nothing.
    if (this.aggregationFilters.length > 0) {
      return;
    }
    // Toggle aggregation expanded attribute
    this.aggregation().expanded = !this.aggregation().expanded;
    // Emit the value to parent.
    this.aggregationClicked.emit({
      key: this.aggregation().key,
      expanded: this.aggregation().expanded,
    });
  }
}
