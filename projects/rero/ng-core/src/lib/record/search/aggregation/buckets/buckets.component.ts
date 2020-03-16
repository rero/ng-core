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
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RecordSearchService } from '../../record-search.service';

@Component({
  selector: 'ng-core-record-search-aggregation-buckets',
  templateUrl: './buckets.component.html'
})
export class BucketsComponent implements OnInit{

  /**
   * Aggregation data
   */
  @Input()
  public buckets: {}[];

  /**
   * Bucket key (facet name)
   */
  @Input()
  public bucketKey: string;

  /**
   * Bucket size
   */
  @Input()
  public aggregationBucketSize: number;

  /**
   * More and less on aggregation content (facet)
   */
  moreMode = true;

  selectedValues: Array<string> = [];

  /**
   * Interface language
   */
  get language() {
    return this.translate.currentLang;
  }

  /**
   * Constructor
   * @param translate TranslateService
   */
  constructor(
    private translate: TranslateService,
    private _recordSearchService: RecordSearchService
  ) {}

  ngOnInit() {
    this._recordSearchService.getAggregationSelectedValues(this.bucketKey).subscribe((selectedValues: Array<string>) => {
      this.selectedValues = selectedValues;
    });
  }

  /**
   * Check if a value is already registered in filters.
   * @param value - string, filter value
   */
  isSelected(value: string) {
    return this.selectedValues.includes(value);
  }

  /**
   * Update selected values with given value and emit event to parent
   * @param value - string, filter value
   */
  updateFilter(value: string) {
    if (this.isSelected(value)) {
      this.selectedValues = this.selectedValues.filter(selectedValue => selectedValue !== value);
    } else {
      this.selectedValues.push(value);
    }
    console.log('buckets', this.selectedValues);
    this._recordSearchService.updateAggregationFilter(this.bucketKey, this.selectedValues);
  }

  /**
   * Return bucket size
   */
  get bucketSize() {
    const aggregationBucketSize = this.buckets.length;
    if (this.aggregationBucketSize === null) {
      return aggregationBucketSize;
    } else {
      if (this.moreMode) {
        return this.aggregationBucketSize;
      } else {
        return aggregationBucketSize;
      }
    }
  }

  /**
   * Set More mode
   * @param state - boolean
   * @return void
   */
  setMoreMode(state: boolean) {
    this.moreMode = state;
  }

  /** Get bucket children
   * @param bucket: parent bucket
   */
  bucketChildren(bucket: any) {
    const aggregations = [];
    for (const k in bucket) {
      if (bucket[k].buckets) {
        aggregations.push({
          key: k,
          buckets: bucket[k].buckets,
          bucketSize: bucket[k].bucketSize
        });
      }
    }
    return aggregations;
  }

  /**
   * Display more or less link
   * @return boolean
   */
  displayMoreAndLessLink(): boolean {
    if (this.aggregationBucketSize === null) {
      return false;
    }
    return this.buckets.length > this.aggregationBucketSize;
  }
}
