import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RecordSearchService } from '../../record-search.service';

@Component({
  selector: 'ng-core-list-filters',
  templateUrl: './list-filters.component.html'
})
export class ListFiltersComponent implements OnChanges {
  /**
   * All aggregations
   */
  @Input() aggregations;

  /**
   * Selected aggregations filters
   */
  @Input() aggregationsFilters;

  /**
   * Search filters
   */
   @Input() searchFilters;

  /**
   * List of selected filters
   */
  filters: Array<any>;

  /**
   * Filters to hide
   */
  filtersToHide = [];

  /**
   * Constructor.
   *
   * @param _recordSearchService - RecordSearch service.
   * @param _ref - ChangeDetectorRef.
   */
  constructor(
    private _recordSearchService: RecordSearchService,
    private _ref: ChangeDetectorRef
  ){ }

  /**
   * Update list of filters on changes.
   *
   * @param changes - SimpleChanges.
   */
  ngOnChanges(changes: SimpleChanges): void {
    // hide searchFilters from list of filters
    this.filtersToHide = this.searchFilters.map(filter => filter.filter);

    if (changes?.aggregationsFilters) {
      this._ref.detach();
      this.filters = [];

      changes.aggregationsFilters.currentValue.map(filter => {
        if (!this.filtersToHide.includes(filter.key)) {
          this.filters = this.filters.concat(
            filter.values.map( value => {
              return {key: value, aggregationKey: filter.key};
            })
          );
        }
      });
    }

    if (changes?.aggregations) {
      changes.aggregations.currentValue.map(item => {
          this.getFilterNames(item.value.buckets);
      });

      this._ref.reattach();
    }

  }

  /**
   * Get displayed name of bucket
   * and fill in filters list.
   *
   * @param bucket - Bucket to get the name from.
   */
  getFilterNames(buckets) {
    if (buckets.length === 0){
      return;
    }

    buckets.map(bucket => {
      for (const k in bucket) {
        if (bucket[k].buckets) {
          this.getFilterNames(bucket[k].buckets);
        }
      }
      if (bucket.name) {
        const index = this.filters.findIndex(filter => filter.key === bucket.key && filter.aggregationKey === bucket.aggregationKey);
        if (index > -1) {
          this.filters[index].name = bucket.name;
          this.filters[index] = {...this.filters[index]};
        }
      }
    });
  }

  /**
   * Remove filter.
   *
   * @param filter - the filter to remove
   */
  remove(filter): void {
    this._recordSearchService.removeFilter(filter.aggregationKey, filter.key, true);
  }
}
