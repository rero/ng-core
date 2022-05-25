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
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, isObservable, Observable, of, Subscription } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import { Error } from '../../error/error';
import { ActionStatus } from '../action-status';
import { JSONSchema7 } from '../editor/editor.component';
import { Aggregation, Record, SearchField, SearchFilter, SearchResult } from '../record';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { AggregationsFilter, RecordSearchService } from './record-search.service';

export interface SearchParams {
  currentType: string;
  index: string;
  q: string;
  page: number;
  size: number;
  aggregationsFilters: Array<AggregationsFilter>;
  sort: string;
  searchFields: Array<SearchField>;
  searchFilters: Array<SearchFilter>;
}

export interface SortOption {
  value: string;
  label: string;
  defaultQuery?: boolean;
  defaultNoQuery?: boolean;
}

@Component({
  selector: 'ng-core-record-search',
  templateUrl: './record-search.component.html'
})
export class RecordSearchComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Current selected resource type
   */
  @Input()
  currentType: string = null;

  /**
   * Search query
   */
  @Input()
  q = '';

  /**
   * Define the current record's page
   */
  @Input()
  page = 1;

  /**
   * Define the number of records per page
   */
  @Input()
  size = 10;

  /**
   * Defined the sort order
   */
  @Input()
  sort: string = null;

  /**
   * If admin mode is disabled, no action
   * can be done on a record, as add, update or remove.
   */
  @Input()
  adminMode: ActionStatus = {
    can: true,
    message: ''
  };

  /**
   * Resources types available
   */
  @Input()
  types: {
    key: string,
    label: string,
    index?: string,
    component?: Component,
    total?: number,
    canAdd?: any,
    canUpdate?: any,
    canDelete?: any,
    canRead?: any,
    permissions?: any,
    aggregations?: any,
    preFilters?: any,
    listHeaders?: any,
    itemHeaders?: any,
    aggregationsName?: any,
    aggregationsOrder?: Array<string>,
    aggregationsExpand?: Array<string> | (() => Array<string>),
    aggregationsBucketSize?: number,
    showSearchInput?: boolean,
    pagination?: {
      boundaryLinks?: boolean,
      maxSize?: number
    },
    formFieldMap?: (field: FormlyFieldConfig, jsonSchema: JSONSchema7) => FormlyFieldConfig,
    hideInTabs?: boolean
  }[] = [{ key: 'documents', label: 'Documents' }];

  /**
   * Custom URL to notice detail
   */
  @Input()
  detailUrl: string = null;

  /**
   * Current aggregations filters applied
   */
  aggregationsFilters: Array<AggregationsFilter> = [];

  /**
   * Contain result row data
   */
  hits: any = [];

  /**
   * Facets retrieved from request result
   */
  aggregations: Array<Aggregation>;

  /**
   * Error message when something wrong happens during a search
   */
  error: Error;

  /**
   * Check if record can be added
   */
  addStatus: ActionStatus = {
    can: true,
    message: ''
  };

  /**
   * List of fields on which we can do a specific search.
   */
  searchFields: Array<SearchField> = [];

  /**
   * List of fields on which we can filter.
   */
   searchFilters: Array<SearchFilter> = [];

  /**
   * Wether to show the empty search message info.
   */
  showEmptySearchMessage = false;

  /**
   * JSON stringified of last search parameters. Used for checking if we have
   * to do a search or not.
   */
  private _searchParameters: BehaviorSubject<SearchParams> = new BehaviorSubject(null);

  /**
   * Define if search input have to be displayed or not.
   */
  private _showSearchInput = true;

  /**
   * Define if title have to be displayed or not.
   */
  private _showLabel = true;

  // Subscriptions to observables.
  private _subscriptions: Subscription = new Subscription();

  /**
   * Store configuration for type
   */
  private _config: any = null;

  /**
   * Output current state when parameters change.
   */
  @Output() parametersChanged = new EventEmitter<any>();

  /**
   * Output current result of records by type
   */
  @Output() recordsSearched = new EventEmitter<SearchResult>();

  /**
   * Constructor.
   *
   * @param _recordService Record service.
   * @param _recordUiService Record UI service.
   * @param _recordSearchService Record search service.
   * @param _translateService Translate service.
   * @param _spinner Spinner service.
   * @param _apiService Api service.
   * @param _activatedRoute Activated Route
   */
  constructor(
    private _recordService: RecordService,
    private _recordUiService: RecordUiService,
    private _recordSearchService: RecordSearchService,
    private _translateService: TranslateService,
    private _spinner: NgxSpinnerService,
    private _apiService: ApiService,
    private _activatedRoute: ActivatedRoute
  ) { }

  /**
   * Component initialization.
   *
   * Subscribes to the observable emitting the aggregations filters.
   *
   * Loads total count of records for each resource.
   */
  ngOnInit() {
    // Subscribe on aggregation filters changes and do search.
    let first = true;
    this._subscriptions.add(
      this._recordSearchService.aggregationsFilters.subscribe((aggregationsFilters: Array<AggregationsFilter>) => {
        // No aggregations filters are set at this time, we do nothing.
        if (aggregationsFilters === null) {
          return;
        }
        aggregationsFilters.forEach((item, key) => {
          aggregationsFilters[key].values = item.values.sort();
        });

        this.aggregationsFilters = aggregationsFilters;

        // if it's the first value emitted, the current page is kept.
        this._searchParamsHasChanged(first === false);

        // not first anymore
        first = false;
      })
    );
    this._subscriptions.add(
      this._searchParameters.asObservable().pipe(
        // only if the patterns changed
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        // cancel previous pending requests
        switchMap(() => {
          if (this.aggregations != null) {
            return of(null);
          }
          return this._config.aggregationsOrder.pipe(
            tap((aggregations: string[]) => {
              this.aggregations = aggregations.map((key: any) => {
                let aggregationsExpandCfg = this._config.aggregationsExpand;
                if (typeof aggregationsExpandCfg === 'function') {
                  aggregationsExpandCfg = aggregationsExpandCfg();
                }
                const expanded = (aggregationsExpandCfg || []).includes(key);
                return {
                  key: key.key || key,
                  bucketSize: this._config.aggregationsBucketSize || null,
                  value: { buckets: [] },
                  expanded,
                  name: key.name || this._aggregationName(key) || null,
                };
              });
            })
          );
        }),
        switchMap(() => this._getRecords())
      ).subscribe(
        (records: Record) => {
          this.hits = records.hits;
          this._spinner.hide();

          // Apply filters
          this.aggregations$(records.aggregations).subscribe((aggregations: any) => {
            for (const agg of this.aggregations) {
              // reset aggregations
              agg.loaded = false;
              agg.value.buckets = [];
              if (agg.key in aggregations) {
                this._mapAggregation(agg, aggregations[agg.key]);
              }
            }
          });

          this._emitNewParameters();
          this.recordsSearched.emit({ type: this.currentType, records });
        },
        (error) => {
          this.error = error;
          this._spinner.hide();
        }
      )
    );
  }

  /**
   * Methods called each time an input property is modified.
   *
   * If current type is changed, the configuration for the new type is loaded.
   *
   * The first time current type is changed, the types property is set in the
   * RecordUiServices. A better way to do that is to detect route change in the
   * service, but at this time it is done like that.
   *
   * This method does a search at the end but only if the search parameters have
   * changed. We want to avoid a double search when the following process is
   * done:
   *
   * 1. A parameter is changed in the search interface.
   * 2. Local property is updated.
   * 3. A search is done.
   * 4. The component outputs the search parameters.
   * 5. The parent component (RecordSearchPage) updates the URL
   * 6. The parent component detects route parameters changes.
   * 7. The parent component update the input value of the component.
   * 8. This method is triggered.
   *
   * @param changes Object containing all the changed properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    // Current type has changed
    if (changes.currentType) {
      if (changes.currentType.firstChange) {
        // Load all configuration types, only during the first change
        this._recordUiService.types = this.types;
      }

      // if the "type" property is changed in input, but the change is not
      // triggered by clicking on a tab (which already load configuration),
      // we reload configuration.
      // If no configuration is loaded, we load it, too.
      if (this._config === null || (changes.currentType.currentValue != null && (changes.currentType.currentValue !== this._config.key))) {
        this._loadConfigurationForType(this.currentType);
      }
    }

    // If it's the first change, we don't do a search, it's delegated to the
    // aggregations filters subscription.
    if (changes[Object.keys(changes)[0]].firstChange === false) {
      // Get records and reset page only if page has not changed
      this._searchParamsHasChanged('page' in changes === false);
    }
  }

  /**
   * Internal notification that the search parameters has changed.
   *
   * @param resetPage reset the page to the first page
   */
  private _searchParamsHasChanged(resetPage: boolean = true) {
    if (resetPage) {
      this.page = 1;
    }
    // Deep copy is sent, to avoid the reference (source object) to be
    // accidentally changed.
    this._searchParameters.next(cloneDeep(this._serializeSearchParameters()));
  }

  /**
   * Component destruction.
   *
   * Unsubscribes from the observable of the aggregations filters.
   */
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  /**
   * Check if pagination have to be displayed
   */
  get showPagination() {
    return this.total > this.size;
  }

  /**
   * Activate the first and last button on pagination
   */
  get paginationBoundaryLinks(): boolean {
    const paginationConfig = this._getResourceConfig('pagination', {});
    return ('boundaryLinks' in paginationConfig) ? paginationConfig.boundaryLinks : false;
  }

  /**
   * Number of pages showed on pagination
   */
  get paginationMaxSize(): number {
    const paginationConfig = this._getResourceConfig('pagination', {});
    return ('maxSize' in paginationConfig)
      ? paginationConfig.maxSize
      : 5;
  }

  /**
   * Contain result data
   *
   * @return list of metadata results.
   */
  get records(): Array<any> {
    return this.hits && this.hits.hits
      ? this.hits.hits
      : [];
  }

  /**
   * Total of records corresponding to request
   *
   * @return integer representing the number of results.
   */
  get total(): number {
    return this.hits && this.hits.total
      ? this._recordService.totalHits(this.hits.total)
      : 0;
  }

  /**
   * Get the text for displaying results text.
   *
   * @return An observable emitting the text.
   */
  get resultsText$(): Observable<string> {
    if (this._config.resultsText) {
      return this._config.resultsText(this.hits);
    }
    return (this.total <= 1)
      ? this._translateService.stream('{{ total }} result', { total: this.total }) // O or 1 result
      : this._translateService.stream('{{ total }} results', { total: this.total });
  }

  /**
   * Get showSearchInput value, given either by config or by local value.
   */
  get showSearchInput(): boolean {
    // at the type level
    if (this._config.showSearchInput != null) {
      return this._config.showSearchInput;
    }
    // route level
    return this._showSearchInput;
  }

  /**
   * Set showSearchInput
   */
  @Input()
  set showSearchInput(showSearchInput: boolean) {
    this._showSearchInput = showSearchInput;
  }

  /**
   * Get showLabel value, given either by config or by local value.
   */
  get showLabel() {
    if (this._config.showLabel != null) {
      return this._config.showLabel;
    }
    return this._showLabel;
  }

  /**
   * Set showLabel
   */
  @Input()
  set showLabel(showLabel: boolean) {
    this._showLabel = showLabel;
  }

  /**
   * Return the current page, used in bootstrap pagination, has we cannot use
   * page property directly.
   */
  get currentPage() {
    return this.page;
  }

  /**
   * Used only for binding with pagination.
   * Avoid side effect if "page" property is bound to pagination
   * (infinite calls to get records).
   * @param page - number, new page
   */
  set currentPage(page: number) {
    this.page = +page;
    this._searchParamsHasChanged(false);
  }

  /**
   * Return the list of search fields that are selected.
   *
   * @return List of selected search fields.
   */
  get selectedSearchFields(): Array<SearchField> {
    return this.searchFields.filter((field: SearchField) => field.selected);
  }

  /**
   * Get the message if there's no record for the type.
   *
   * The message can be customized with the `noRecordMessage` property in route configuration.
   *
   * @returns A message indicating there's no record.
   */
  get emptyRecordMessage(): string {
    return this._config.noRecordMessage || this._translateService.instant('There are no records in this section');
  }

  /**
   * Check if the current type has no record.
   *
   * @returns True if no record is found and no search query is done.
   */
  get hasNoRecord(): boolean {
    return !this.q && this.records.length === 0 && !this.showEmptySearchMessage;
  }

  /**
   * Returns the list of types that are displayed in tabs.
   *
   * @return List of types.
   */
  get typesInTabs(): Array<any> {
    return this.types.filter((item) => item.hideInTabs !== true);
  }

  /**
   * Return the sort options.
   */
  get sortOptions(): Array<SortOption> {
    if (!this._config.sortOptions) {
      return [];
    }

    return this._config.sortOptions.sort((a: SortOption, b: SortOption) => {
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Return the current sort object.
   */
  get currentSortOption(): SortOption {
    if (!this.sort || !this._config.sortOptions) {
      return null;
    }
    return this._config.sortOptions.find((item: SortOption) => item.value === this.sort);
  }

  /**
   * Change number of items per page value.
   * @param event - Event, dom event triggered
   * @param size - number, new page size
   */
  changeSize(event: Event, size: number) {
    event.preventDefault();
    this.size = size;
    this._searchParamsHasChanged();
  }

  /**
   * Change sorting.
   *
   * @param sortOption Sort option object.
   */
  changeSorting(sortOption: SortOption) {
    this.sort = sortOption.value;
    this._searchParamsHasChanged();
  }

  /**
   * Change query text.
   * @param event - string, new query text
   */
  searchByQuery(event: string) {
    // If empty search is not allowed and query is empty, the search is not processed.
    if (this._config.allowEmptySearch === false && !event) {
      this.showEmptySearchMessage = true;
      return;
    }

    this.q = event;
    this.aggregationsFilters = [];
    this._setDefaultSort();
    this._searchParamsHasChanged();
    this._recordSearchService.setAggregationsFilters(
      this._extractPersistentAggregationsFilters(),
      true
    );
  }

  /**
   * Change type of records.
   * @param event - Event, dom event triggered
   * @param type - string, type of resource
   */
  changeType(event: Event, type: string) {
    event.preventDefault();

    this.currentType = type;
    this._loadConfigurationForType(this.currentType);
    this.aggregationsFilters = [];
    this._searchParamsHasChanged();
    this._recordSearchService.setAggregationsFilters([]);
  }

  /**
   * Delete a record by its PID.
   * @param pid - string, PID to delete
   */
  deleteRecord(pid: string) {
    this._recordUiService.deleteRecord(this.currentType, pid).pipe(
      switchMap(result => {
        if (result === true) {
          this.page = 1;
          return this._getRecords();
        }
        return of(null);
      })
    ).subscribe((records: Record) => {
      if (records != null) {
        this.hits = records.hits;
        this._spinner.hide();
      }
    });
    // update main counter
    this._config.total--;
  }

  /**
   * Get component view for the current resource type.
   * @retun A component for displaying result item.
   */
  getResultItemComponentView() {
    if (this._config.component) {
      return this._config.component;
    }
    return null;
  }

  /**
   * Get Export formats for the current resource given by configuration.
   * @return Array of export format to generate an `export as` button or an empty array.
   */
  get exportFormats(): Array<any> {
    if (this._config && this._config.exportFormats) {
      return this._config.exportFormats;
    }
    return [];
  }

  /**
   * Get export format url.
   * @param format - export format object
   * @return formatted url for an export format.
   */
  getExportFormatUrl(format: any) {
    // TODO: maybe we can use URLSerializer to build query string
    const baseUrl = format.endpoint
      ? format.endpoint
      : this._apiService.getEndpointByType(this._currentIndex());
    let url = `${baseUrl}?q=${encodeURIComponent(this.q)}&format=${format.format}`;

    // check if max rest result size is disabled
    if (!format.disableMaxRestResultsSize) {
      url += `&size=${RecordService.MAX_REST_RESULTS_SIZE}`;
    }
    // preFilters
    if (this._config && this._config.preFilters) {
      for (const [key, value] of Object.entries(this._config.preFilters)) {
        // force value to an array
        const values = (!Array.isArray(value)) ? [value] : value;
        values.map(v => {
          url += `&${key}=${v}`;
        });
      }
    }
    // aggregations
    if (this.aggregationsFilters) {
      this.aggregationsFilters.map(filter => {
        filter.values.map(v => {
          url += `&${filter.key}=${v}`;
        });
      });
    }
    return url;
  }

  /**
   * Check if a record list can be exported
   * @param format - export format object
   * @return Boolean
   */
  canExport(format: any): boolean {
    return (format.hasOwnProperty('disableMaxRestResultsSize') && format.disableMaxRestResultsSize)
      ? this.total > 0
      : this.total > 0 && this.total < RecordService.MAX_REST_RESULTS_SIZE;
  }

  /**
   * Return a message containing the reasons why record list cannot be exported
   * @return Boolean
   */
  get exportInfoMessage(): string {
    return (this.total === 0)
      ? this._translateService.instant('Result list is empty.')
      : this._translateService.instant('Too many items. Should be less than {{max}}.',
        { max: RecordService.MAX_REST_RESULTS_SIZE }
      );
  }

  /**
   * Check if a record can be updated
   * @param record - object, record to check
   * @return Observable
   */
  canUpdateRecord$(record: object): Observable<ActionStatus> {
    return this._recordUiService.canUpdateRecord$(record, this.currentType);
  }

  /**
   * Check if a record can be deleted
   * @param record - object, record to check
   * @return Observable
   */
  canDeleteRecord$(record: object): Observable<ActionStatus> {
    return this._recordUiService.canDeleteRecord$(record, this.currentType);
  }

  /**
   * Check if a record can be used
   * @param record - object, record to check
   * @return Observable
   */
  canUseRecord$(record: object): Observable<ActionStatus> {
    return this._recordUiService.canUseRecord$(record, this.currentType);
  }

  /**
   * Filter the aggregations with given configuration function.
   * If no configuration is given, return the original aggregations.
   * @param records - Result records
   * @return Observable containing aggregations corresponding to actual records.
   */
  aggregations$(aggregations: object): Observable<any> {
    if (this._config.aggregations) {
      return this._config.aggregations(aggregations);
    } else {
      return of(aggregations);
    }
  }

  /**
   * Returns an observable which emits the URL value for given record.
   * In case record cannot be read, returns null.
   * @param record - Generate detail URL for this record.
   * @return Observable emitting detail URL object
   */
  resolveDetailUrl$(record: any): Observable<any> {
    const url = { link: `detail/${record.id}`, external: false };

    if (this.detailUrl) {
      url.link = this.detailUrl.replace(':type', this._currentIndex()).replace(':pid', record.id);
      url.external = true;
    }

    if (!this._config.canRead) {
      return of(url);
    }

    return this._recordUiService.canReadRecord$(record, this.currentType).pipe(
      map((status: ActionStatus) => {
        if (status.can === false) {
          return null;
        }

        return url;
      })
    );
  }

  /**
   * Select or deselect a search field and launch a search if a query is specified.
   *
   * @param field SearchField
   * @returns void
   */
  searchInField(field: SearchField): void {
    // Toggle the current field and un-select others.
    this.searchFields = this.searchFields.map((item: SearchField) => {
      if (item === field) {
        item.selected = !item.selected;
      } else {
        item.selected = false;
      }
      return item;
    });

    // If query string is specified, search is processed.
    if (this.q) {
      this.searchByQuery(this.q);
    }
  }

  /**
   * Select or deselect a search filter.
   *
   * @param filter SearchFilter
   * @returns void
   */
  searchFilter(filter: SearchFilter): void {
    let values = [];
    const agg = this.aggregationsFilters.filter((item: any) => {
      return item.key === filter.filter;
    });
    if (agg.length > 0) {
      const aggFilter = agg[0];
      if (!aggFilter.values.includes(filter.value)) {
        values = [filter.value];
      } else {
        if (filter.disabledValue) {
          values = [filter.disabledValue];
        }
      }
    } else {
      values = [filter.value];
    }

    this._recordSearchService.updateAggregationFilter(filter.filter, values);
  }

  /**
   * Check if a filter is selected.
   *
   * @param filter SearchFilter
   * @returns true if the given filter is selected.
   */
  isFilterActive(filter: SearchFilter): boolean {
    if (!this.aggregationsFilters) {
      return false;
    }
    return this.aggregationsFilters.some((item: any) => {
      return item.key === filter.filter && item.values.includes(String(filter.value));
    });
  }

  /**
   * Load buckets for the given aggregation.
   *
   * @param event Object outputted when an aggregation is clicked.
   * @returns void
   */
  loadAggregationBuckets(event: { key: string, expanded: boolean }): void {
    // the aggregation is collapsed, buckets are not loaded.
    if (event.expanded === false) {
      return;
    }

    const aggregation = this.aggregations.find((item: any) => item.key === event.key);

    // No aggregation found or buckets are already loaded.
    if (!aggregation || aggregation.loaded) {
      return;
    }

    // Get buckets for the aggregation
    this._getRecords(1).subscribe((records: any) => {
      this.aggregations$(records.aggregations).subscribe((aggregations: any) => {
        if (aggregations[event.key]) {
          this._mapAggregation(aggregation, aggregations[event.key]);
        }
        this._spinner.hide();
      });

    });
  }

  /**
   * Search for records.
   *
   * @param size Force size.
   */
  private _getRecords(size: number = null): Observable<any> {
    // Build query string
    const q = this._buildQueryString();

    // Empty search is not allowed and query is empty, search in backend is not
    // processed.
    if (this._config.allowEmptySearch === false && !q) {
      this.showEmptySearchMessage = true;
      return of({ hits: { hits: [], total: 0 }, aggregations: {} });
    } else {
      this.showEmptySearchMessage = false;
    }

    this._spinner.show();
    // Check remove filter from preFilters if it is already present in
    // the aggs filters.
    const preFilters = {};
    const aggsKeys = [];
    this.aggregationsFilters.map(agg => aggsKeys.push(agg.key));
    for (const [key, value] of Object.entries(this._config.preFilters || {})) {
      if (!(aggsKeys.includes(key))) {
        preFilters[key] = value;
      }
    }
    return this._recordService.getRecords(
      this._currentIndex(),
      q,
      this.page,
      size || this.size,
      this.aggregationsFilters || [],
      preFilters,
      this._config.listHeaders || null,
      this.sort,
      this._getFacetsParameter()
    );
  }


  /**
   * Emit new parameters when a search is done.
   */
  private _emitNewParameters() {
    this.parametersChanged.emit({
      q: this.q,
      page: this.page,
      size: this.size,
      currentType: this._config.key,
      index: this._config.index,
      aggregationsFilters: this.aggregationsFilters,
      sort: this.sort
    });
  }

  /**
   * Get configuration for the current resource type.
   * @param type Type of resource
   */
  private _loadConfigurationForType(type: string) {
    this._config = this._recordUiService.getResourceConfig(type);
    this._recordUiService.canAddRecord$(type).subscribe((result: ActionStatus) => {
      this.addStatus = result;
    });

    this._loadSearchFields();

    // Build aggregations.
    if (this._config.aggregationsOrder) {
      if (!isObservable(this._config.aggregationsOrder)) {
        this._config.aggregationsOrder = of(this._config.aggregationsOrder);
      }
    } else {
      this._config.aggregationsOrder = of([]);
    }

    // reset aggregations
    this.aggregations = null;

    // Sort options
    this._setDefaultSort();

    // load search filters
    this.searchFilters = this._config.searchFilters ? this._config.searchFilters : [];
  }

  /**
   * Get Resource config
   * @param paramName - Name of parameter
   * @param defaultValue - Default value is returned if the parameter is not defined
   * @return A config value or the given default value instead
   */
  private _getResourceConfig(paramName: string, defaultValue: any) {
    return (paramName in this._config) ? this._config[paramName] : defaultValue;
  }

  /**
   * Serialize all the search parameters with JSON.stringify method.
   * @return The serialized string.
   */
  private _serializeSearchParameters(): SearchParams {
    return {
      currentType: this._config.key,
      index: this._currentIndex(),
      q: this.q,
      page: this.page,
      size: this.size,
      sort: this.sort,
      aggregationsFilters: this.aggregationsFilters,
      searchFields: this.searchFields,
      searchFilters: this.searchFilters
    };
  }

  /**
   * Load search fields stored in configuration and assign to them the
   * `selected` property.
   *
   * @returns void
   */
  private _loadSearchFields(): void {
    // No search fields, reset previous stored and return.
    if (!this._config.searchFields) {
      this.searchFields = [];
      return;
    }

    // Store search fields.
    this.searchFields = this._config.searchFields.map((field: SearchField) => {
      if (!field.selected) {
        field.selected = false;
      }
      return field;
    });
  }

  /**
   * Build query string with possibly search fields.
   *
   * @return Final query string.
   */
  private _buildQueryString(): string {
    // If query is empty or no selected fields found, the initial query string
    // is returned.
    if (!this.q || this.selectedSearchFields.length === 0) {
      return this.q;
    }

    // Loop over select fields and add them to final query string.
    const queries = [];
    this.selectedSearchFields.forEach((field: SearchField) => {
      queries.push(`${field.path}:${this.q}`);
    });

    return queries.join(' ');
  }

  /**
   * Return the name of the index defined either by the index key or key.
   *
   * @return string, current index defined by keys index or key
   */
  private _currentIndex() {
    if (this._config == null) {
      return null;
    }
    return this._config.index
      ? this._config.index
      : this._config.key;
  }

  /**
   * Get personalized name for current aggregation
   * @param key - string, aggregation key
   * @return string or null
   */
  private _aggregationName(key: string): string | null {
    return this._config.aggregationsName && key in this._config.aggregationsName
      ? this._config.aggregationsName[key]
      : null;
  }

  /**
   * Extract persistent search filters on current url
   * @return Array of aggregations filter
   */
  private _extractPersistentAggregationsFilters(): Array<AggregationsFilter> {
    const persistent = [];
    const filters = this.searchFilters.filter(filter => filter.persistent === true);
    filters.forEach((filter: SearchFilter) => {
      if (this._activatedRoute.snapshot.queryParams.hasOwnProperty(filter.filter)) {
        let data = this._activatedRoute.snapshot.queryParams[filter.filter];
        if (!Array.isArray(data)) {
          data = [data];
        }
        persistent.push({ key: filter.filter, values: data });
      }
    });
    return persistent;
  }

  /**
   * Map aggregation records data to corresponding aggregation.
   *
   * @param aggregation Aggregation object.
   * @param recordAggregation Aggregation retrieved from record.
   */
  private _mapAggregation(aggregation: Aggregation, recordsAggregation: any): void {
    aggregation.doc_count = recordsAggregation.doc_count || null;
    aggregation.type = recordsAggregation.type || 'terms';
    aggregation.config = recordsAggregation.config || null;
    if (!aggregation.name && recordsAggregation.name) {
      aggregation.name = recordsAggregation.name;
    }
    aggregation.value.buckets = recordsAggregation.buckets;
    if (recordsAggregation.doc_count != null) {
      aggregation.doc_count = recordsAggregation.doc_count;
    }
    aggregation.value.buckets.map(bucket => this.processBuckets(bucket, aggregation.key));
    aggregation.loaded = true;
  }

  /**
   * Enrich the bucket with several properties: indeterminate, parent, aggregationKey.
   *
   * @param bucket elastic bucket to process
   * @param aggregationKey bucket parent key
   * @returns the indeterninate state of the bucket
   */
  processBuckets(bucket, aggregationKey): boolean {
    // checkbox indeterminate state
    bucket.indeterminate = false;
    for (const k of Object.keys(bucket).filter(key => bucket[key].buckets)) {
      for (const childBucket of bucket[k].buckets) {
          // store the parent: usefull to remove parent filters
          childBucket.parent = bucket;
          // store the aggregation key as we re-organize the bucket structure
          bucket.aggregationKey = aggregationKey;
          bucket.indeterminate ||= this._recordSearchService.hasFilter(k, childBucket.key);
          // do not change the order of the boolean expression to force processBucket over all
          // recursion steps
          bucket.indeterminate = this.processBuckets(childBucket, k) || bucket.indeterminate;
        }
    }
    return bucket.indeterminate;
  }

  /**
   * Compile facets keys to get only expanded facets or having a filter selected.
   *
   * @returns List of facets.
   */
  private _getFacetsParameter(): Array<string> {
    const facets = [];
    this.aggregations.forEach((agg: any) => {
      if (agg.expanded === true || this.aggregationsFilters.some((filter: any) => filter.key === agg.key)) {
        facets.push(agg.key);
      }
    });
    return facets;
  }

  /**
   * Set the default sort.
   */
  private _setDefaultSort(): void {
    if (this.sort != null) {
      return;
    }
    if (this._config.sortOptions) {
      const defaulSortValue = this.q ? 'defaultQuery' : 'defaultNoQuery';
      this._config.sortOptions.forEach((option: SortOption) => {
        if (option[defaulSortValue] === true) {
          this.sort = option.value;
        }
      });
    }
  }
}
