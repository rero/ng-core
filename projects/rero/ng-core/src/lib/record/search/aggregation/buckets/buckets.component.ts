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
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslateLanguageService } from '../../../../translate/translate-language.service';
import { AggregationsFilter, RecordSearchService } from '../../record-search.service';

@Component({
  selector: 'ng-core-record-search-aggregation-buckets',
  templateUrl: './buckets.component.html',
  styleUrls: ['./buckets.component.scss']
})
export class BucketsComponent implements OnInit, OnDestroy, OnChanges {
  // COMPONENT ATTRIBUTES ============================================================
  /** Buckets list for aggregation */
  @Input() buckets: Array<any>;
  /** Aggregation key */
  @Input() aggregationKey: string;
  /** Bucket size, if not null, reduce displayed items to this size. */
  @Input() size: number;

  /** More and less on aggregation content (facet) */
  moreMode = true;
  /** Current selected values for the aggregations */
  aggregationsFilters: Array<AggregationsFilter> = [];
  /** Children of current bucket */
  bucketChildren: any = {};

  /** Subscription to aggregationsFilters observable */
  private _aggregationsFiltersSubscription: Subscription;


  // GETTERS & SETTERS =================================================================
  /** Returns selected filters for the aggregation key. */
  get aggregationFilters(): Array<string> {
    const aggregationFilters = this.aggregationsFilters.find((item: AggregationsFilter) => item.key === this.aggregationKey);
    return aggregationFilters === undefined
        ? []
        : aggregationFilters.values;
  }

  /** Get bucket size. */
  get bucketSize(): number {
    const size = this.buckets.length;
    return this.size === null || this.moreMode === false
        ? size
        : this.size;
  }

  /** Get the number of bucket items with non-zero doc_count. */
  get bucketsLength(): number {
    return this.buckets.reduce((acc, bucket) => (bucket.doc_count) ? acc+1 : acc, 0);
  }

  /** Should display more or less link for a bucket ? */
  get displayMoreAndLessLink(): boolean {
    return (this.size === null)
        ? false
        : this.bucketsLength > this.size;
  }

  // CONSTRUCTOR & HOOKS ==============================================================
  /**
   * Constructor
   * @param _translateService - TranslateService
   * @param _recordSearchService - RecordSearchService
   * @param _translateLanguage - TranslateLanguageService
   */
  constructor(
    private _translateService: TranslateService,
    private _recordSearchService: RecordSearchService,
    private _translateLanguage: TranslateLanguageService
  ) {}

  /**
   * OnInit hook
   *   Subscribe to aggregations filters observable for getting the aggregations filters each time
   *   they will change.
   */
  ngOnInit() {
    this._aggregationsFiltersSubscription = this._recordSearchService
        .aggregationsFilters
        .subscribe((aggregationsFilters: Array<AggregationsFilter>) => {
          if (aggregationsFilters !== null) {
            this.aggregationsFilters = aggregationsFilters;
          }
        });
  }

  /**
   * OnChanges hook
   *   Called each time an input property is modified.
   *   If buckets are changed, refresh children buckets.
   * @param changes - bucket changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.buckets) {
      for (const bucket of this.buckets) {
        this.bucketChildren[bucket.key] = this.getBucketChildren(bucket);
      }
    }
  }

  /**
   * OnDestroy hook
   *   Unsubscribes from the observable of aggregations filters.
   */
  ngOnDestroy() {
    this._aggregationsFiltersSubscription.unsubscribe();
  }

  // COMPONENT F£UNCTIONS =====================================================
  /**
   * Check if a value is present in selected filters.
   * @param value: filter value (could be string, number, ...)
   * @return `true` if value is present in the aggregation filters, `false` otherwise.
   */
  isSelected(value: any): boolean {
    return this.aggregationFilters.includes(value.toString());
  }

  /**
   * Do we need to display the children?
   * @return `true` if we want to display the children, `false` otherwise.
   */
  displayChildren(bucket): boolean {
    return (
      this.isSelected(bucket.key) ||
      // not necessary but faster than hasChildrenFilter
      bucket.indeterminate ||
      // hasChildrenFilter is required to avoid blinks when a child is selected
      this._recordSearchService.hasChildrenFilter(bucket)
    );
  }

  /**
   * Update selected filters by adding or removing the given value and push
   * values to service.
   * @param bucket - string: the selected bucket value (checked OR unchecked)
   */
  updateFilter(bucket: any) {
    const index = this.aggregationsFilters.findIndex((item: AggregationsFilter) => item.key === this.aggregationKey);

    if (index === -1) {
      // No filters exist for the aggregation.
      this._recordSearchService.updateAggregationFilter(this.aggregationKey, [bucket.key], bucket);
    } else {
      const aggFilter = this.aggregationsFilters[index];
      if (!aggFilter.values.includes(bucket.key.toString())) {
        // Bucket value is not yet selected, we add value to selected values.
        this.aggregationsFilters[index].values.push(bucket.key.toString());
        this._recordSearchService.updateAggregationFilter(
          this.aggregationKey,
          this.aggregationsFilters[index].values,
          bucket
        );
      } else {
        // Removes value from selected values and all children selected values.
        this._recordSearchService.removeAggregationFilter(this.aggregationKey, bucket);
      }
    }
  }

  /**
   * Get children buckets
   * @param bucket: parent bucket
   * @return Bucket children list of given bucket
   */
  getBucketChildren(bucket: any): Array<any> {
    const children = [];
    for (const k of Object.keys(bucket).filter(key => typeof bucket[key] === 'object' && bucket[key].buckets)) {
      children.push({
        aggregationKey: k,
        bucketSize: this.bucketSize,
        key: k,
        buckets: bucket[k].buckets,
      });
    }
    return children;
  }
}
