/*
 * RERO angular core
 * Copyright (C) 2022-2024 RERO
 * Copyright (C) 2022 UCLouvain
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
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable, Subscription, isObservable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import { Error } from '../../error/error';
import { ActionStatus } from '../action-status';
import { JSONSchema7 } from '../editor/editor.component';
import { Aggregation, Record, SearchField, SearchFilter, SearchFilterSection, SearchResult } from '../record';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { AggregationsFilter, RecordSearchService } from './record-search.service';
import { ChangeEvent } from './paginator/paginator.component';
import { TabViewChangeEvent } from 'primeng/tabview';
import { IChecked } from './search-filters/search-filters.component';
import { DropdownChangeEvent } from 'primeng/dropdown';

export interface SearchParams {
  currentType: string;
  index: string;
  q: string;
  page: number;
  size: number;
  aggregationsFilters: Array<AggregationsFilter>;
  sort: string;
  searchFields: Array<SearchField>;
  searchFilters: Array<SearchFilter|SearchFilterSection>;
}

export interface SortOption {
  value: string;
  label: string;
  defaultQuery?: boolean;
  defaultNoQuery?: boolean;
}

@Component({
  selector: 'ng-core-record-search',
  templateUrl: './record-search.component.html',
  styleUrl: './record-search.component.scss'
})
export class RecordSearchComponent implements OnInit, OnChanges, OnDestroy {

  /** Page anchor to scroll on the top */
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  // COMPONENT ATTRIBUTES =====================================================
  /** Current selected resource type */
  @Input() currentType: string = null;
  /** Search query */
  @Input() q = '';
  /** Define the current record's page */
  @Input() page = 1;
  /** Define the number of records per page */
  @Input() size = 10;
  /** Defined the sort order */
  @Input() sort: string = null;
  /** If admin mode is disabled, no action can be performed on a record (as add, update or remove) */
  @Input() adminMode: ActionStatus = {can: true, message: '' };
  /** Custom URL to notice detail */
  @Input() detailUrl: string = null;
  /** Resources types available */
  @Input() types: {
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
    defaultSearchInputFilters?: Array<AggregationsFilter>,
    listHeaders?: any,
    itemHeaders?: any,
    aggregationsName?: any,
    aggregationsOrder?: Array<string>,
    aggregationsExpand?: Array<string> | (() => Array<string>),
    aggregationsHide?: Array<string> | (() => Array<string>),
    aggregationsBucketSize?: number,
    showSearchInput?: boolean,
    pagination?: {
      boundaryLinks?: boolean,
      maxSize?: number,
      pageReport?: boolean,
      rowsPerPageOptions?: number[],
    },
    formFieldMap?: (field: FormlyFieldConfig, jsonSchema: JSONSchema7) => FormlyFieldConfig,
    hideInTabs?: boolean
  }[] = [{ key: 'documents', label: 'Documents' }];

  /** Output current state when parameters change. */
  @Output() parametersChanged = new EventEmitter<any>();
  /** Output current result of records by type. */
  @Output() recordsSearched = new EventEmitter<SearchResult>();

  /** Current aggregations filters applied */
  aggregationsFilters: Array<AggregationsFilter> = [];
  /** Contain result row data */
  hits: any = [];
  /** Facets retrieved from requested result */
  aggregations: Array<Aggregation>;
  /** Aggregation keys to always hide (defined into the config) */
  aggregationsToHide: Array<string> = [];
  /** Error message when something wrong happens during a search */
  error: Error;
  /** Check if record can be added */
  addStatus: ActionStatus = {can: true, message: ''};
  /** List of fields on which we can do a specific search. */
  searchFields: Array<SearchField> = [];
  /** List of fields on which we can filter. */
  searchFilters: Array<SearchFilter|SearchFilterSection> = [];
  /** If we need to show the empty search message info. */
  showEmptySearchMessage = false;
  /** Export formats configuration. */
  exportOptions: {
    label: string,
    url: string,
    disabled?: boolean,
    disabled_message?: string
  }[];


  /** JSON dumping of last search parameters (used for checking if we have to do a search or not).*/
  protected _searchParameters: BehaviorSubject<SearchParams> = new BehaviorSubject(null);
  /** Define if search input have to be displayed or not. */
  protected _showSearchInput = true;
  /** Define if title have to be displayed or not. */
  protected _showLabel = true;
  /** Subscriptions to observables. */
  protected _subscriptions: Subscription = new Subscription();
  /** Store configuration for type. */
  protected config: any = null;

  availableTypes = [];

  activeTypeIndex = 0;

  // GETTER & SETTER ==========================================================
  /** Check if pagination have to be displayed or not. */
  get showPagination(): boolean {
    return this.total > this.size;
  }

  /** Does it require to activate the first and last button on pagination. */
  get paginationBoundaryLinks(): boolean {
    const paginationConfig = this._getResourceConfig('pagination', {});
    return ('boundaryLinks' in paginationConfig) ? paginationConfig.boundaryLinks : false;
  }

  /** Get the number of pages showed on pagination. */
  get paginationMaxSize(): number {
    const paginationConfig = this._getResourceConfig('pagination', {});
    return ('maxSize' in paginationConfig)
        ? paginationConfig.maxSize
        : 5;
  }

  /** Request result record hits. */
  get records(): Array<any> {
    return this.hits && this.hits.hits
        ? this.hits.hits
        : [];
  }

  /** Total records number corresponding to the request. */
  get total(): number {
    return this.hits && this.hits.total
        ? this.recordService.totalHits(this.hits.total)
        : 0;
  }

  /** Get the text for displaying results text. */
  get resultsText$(): Observable<string> {
    if (this.config.resultsText) {
      return this.config.resultsText(this.hits);
    }
    return (this.total <= 1)
        ? this.translateService.stream('{{ total }} result', { total: this.total }) // O or 1 result
        : this.translateService.stream('{{ total }} results', { total: this.total });
  }

  /** Get showSearchInput value, given either by config or by local value. */
  get showSearchInput(): boolean {
    if (this.config.showSearchInput != null) {
      return this.config.showSearchInput;
    }
    return this._showSearchInput;
  }

  /** Setter for `showSearchInput`. */
  @Input() set showSearchInput(showSearchInput: boolean) {
    this._showSearchInput = showSearchInput;
  }

  /** Get showLabel value, given either by config or by local value. */
  get showLabel(): boolean {
    if (this.config.showLabel != null) {
      return this.config.showLabel;
    }
    return this._showLabel;
  }

  /** Setter for `showLabel`. */
  @Input() set showLabel(showLabel: boolean) {
    this._showLabel = showLabel;
  }

  /** Return the current page (used in bootstrap pagination, has we cannot use `page` property directly) */
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
   * @return List of selected search fields.
   */
  get selectedSearchFields(): Array<SearchField> {
    return this.searchFields.filter((field: SearchField) => field.selected);
  }

  /**
   * Get the message if there's no record for the type.
   * The message can be customized with the `noRecordMessage` property in route configuration.
   * @returns A message indicating there's no record.
   */
  get emptyRecordMessage(): string {
    return this.config.noRecordMessage || this.translateService.instant('There are no records in this section');
  }

  /**
   * Check if the current type has no record.
   * @returns True if no record is found and no search query is done.
   */
  get hasNoRecord(): boolean {
    return (this.config.showFacetsIfNoResults)
        ? false
        : !this.q && this.records.length === 0 && !this.showEmptySearchMessage;
  }

  /** Return a message containing the reasons why record list cannot be exported. */
  get exportInfoMessage(): string {
    return (this.total === 0)
        ? this.translateService.instant('Result list is empty.')
        : this.translateService.instant('Too many items. Should be less than {{max}}.', { max: RecordService.MAX_REST_RESULTS_SIZE });
  }

  // CONSTRUCTOR & HOOKS ======================================================
  /**
   * Constructor.
   *
   * @param recordService Record service.
   * @param recordUiService Record UI service.
   * @param recordSearchService Record search service.
   * @param translateService Translate service.
   * @param spinner Spinner service.
   * @param apiService Api service.
   * @param activatedRoute Activated Route
   */
  constructor(
    protected recordService: RecordService,
    protected recordUiService: RecordUiService,
    protected recordSearchService: RecordSearchService,
    protected translateService: TranslateService,
    protected spinner: NgxSpinnerService,
    protected apiService: ApiService,
    protected activatedRoute: ActivatedRoute
  ) { }

  /**
   * OnInit hook.
   *   Subscribes to the observable emitting the aggregations filters.
   *   Loads total count of records for each resource.
   */
  ngOnInit() {
    this._subscriptions.add(this.translateService.onLangChange.subscribe((lang: any) => {
      this._loadSearchFields();
    }));
    this.availableTypes = this.types.filter((item) => item.hideInTabs !== true);
    this.activeTypeIndex = this.availableTypes.findIndex((type: any) => type.key === this.currentType);
    // Subscribe on aggregation filters changes and do search.
    let first = true;

    // Load the possible aggregation asked to search engine and that always need to be hide.
    // DEV NOTE : These aggregation should be used by other components (using content injection)
    //            otherwise it doesn't matter to ask them.
    if (this.config.aggregationsHide) {
      this.aggregationsToHide = (typeof this.config.aggregationsHide === 'function')
        ? this.config.aggregationsHide()
        : this.config.aggregationsHide;
    }

    this._subscriptions.add(
      this.recordSearchService.aggregationsFilters.subscribe((aggregationsFilters: Array<AggregationsFilter>) => {
        // No aggregations filters are set at this time, we do nothing.
        if (aggregationsFilters === null) {
          return;
        }
        aggregationsFilters.forEach((item, key) => aggregationsFilters[key].values = item.values.sort());
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
          return this.config.aggregationsOrder.pipe(
            tap((aggregations: string[]) => {
              let aggregationsExpandCfg = this.config.aggregationsExpand;
              if (typeof aggregationsExpandCfg === 'function') {
                aggregationsExpandCfg = aggregationsExpandCfg();
              }
              this.aggregations = aggregations.map((key: any) => {
                return {
                  key: key.key || key,
                  bucketSize: this.config.aggregationsBucketSize || null,
                  value: { buckets: [] },
                  expanded: (aggregationsExpandCfg || []).includes(key),
                  included: ([...aggregationsExpandCfg, ...this.aggregationsToHide] || []).includes(key),
                  name: key.name || this._aggregationName(key) || null,
                };
              });
            })
          );
        }),
        tap(() => this.hits = []),
        switchMap(() => this._getRecords())
      ).subscribe(
        (records: Record) => {
          this.hits = records.hits;
          this.spinner.hide();
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
          // Required to fire onChange event
          this.aggregations = [...this.aggregations];
          this._emitNewParameters();
          this.recordsSearched.emit({ type: this.currentType, records });
          // reload export options
          this.exportOptions = this._exportFormats();
        },
        (error) => {
          this.error = error;
          this.spinner.hide();
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
        this.recordUiService.types = this.types;
      }

      // if the "type" property is changed in input, but the change is not
      // triggered by clicking on a tab (which already load configuration),
      // we reload configuration.
      // If no configuration is loaded, we load it, too.
      if (this.config === null || (changes.currentType.currentValue != null && (changes.currentType.currentValue !== this.config.key))) {
        this._loadConfigurationForType(this.currentType);
      }
    }

    // If it's the first change, we don't do a search, it's delegated to the
    // aggregations filters subscription.
    if (changes[Object.keys(changes)[0]].firstChange === false) {
      // Get records and reset page only if page has not changed
      this._searchParamsHasChanged(!('page' in changes));
    }
  }

  /**
   * OnDestroy hook
   *  Unsubscribes from the observable of the aggregations filters.
   */
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  // COMPONENT FUNCTIONS ======================================================
  /**
   * Internal notification that notify the search parameters has changed.
   * @param resetPage reset the pager to the first page
   */
  protected _searchParamsHasChanged(resetPage: boolean = true) {
    if (resetPage) {
      this.page = 1;
    }
    // Deep copy is sent, to avoid the reference (source object) to be
    // accidentally changed.
    this._searchParameters.next(cloneDeep(this._serializeSearchParameters()));
  }

  /** Move to the top of the page if you change page */
  pageChanged() {
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
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
   * @param sort sort name.
   */
  changeSorting(sort: string) {
    this.sort = sort;
    this._searchParamsHasChanged();
  }

  /**
   * Change query text.
   * @param event - string, new query text
   */
  searchByQuery(event: string) {
    // If empty search is not allowed and query is empty, the search is not processed.
    if (this.config.allowEmptySearch === false && !event) {
      this.showEmptySearchMessage = true;
      return;
    }

    this.q = event;
    this._setDefaultSort();
    this._searchParamsHasChanged();

    // Build aggregations to used.
    //   This is a combination of `defaultSearchInputFilters` and persistent aggregation filters.
    const aggregations = new Set(this._extractPersistentAggregationsFilters());
    this.aggregationsFilters.forEach((aggregation) => aggregations.add(aggregation));
    this.recordSearchService.setAggregationsFilters(Array.from(aggregations), true);
  }

  /**
   * Change type of records.
   * @param TabViewChangeEvent - Defines the custom events used by the component's emitters.
   */
  changeType(event: TabViewChangeEvent) {
    this.currentType = this.availableTypes[event.index].key;
    this._loadConfigurationForType(this.currentType);
    this.aggregationsFilters = [];
    this._searchParamsHasChanged();
    this.recordSearchService.setAggregationsFilters([]);
  }

  /**
   * Delete a record by its PID.
   * @param event - object
   */
  deleteRecord(event: { pid: string, type?: string }) {
    const type = event.type ?? this.currentType;
    this.recordUiService.deleteRecord(type, event.pid).pipe(
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
        this.spinner.hide();
      }
    });
    // update main counter
    this.config.total--;
  }

  /**
   * Get component view for the current resource type.
   * @return A component for displaying result item.
   */
  getResultItemComponentView() {
    return (this.config.component)
      ? this.config.component
      : null;
  }

  /**
   * Get Export formats for the current resource given by configuration.
   * @return Array of export format to generate an `export as` button or an empty array.
   */
<<<<<<< HEAD
  protected _exportFormats(): Array<any> {
    if (!this._config || !this._config.exportFormats) {
=======
  private _exportFormats(): Array<any> {
    if (!this.config || !this.config.exportFormats) {
>>>>>>> 06d34b1 (refactor: primeng)
      return [];
    }
    return this.config.exportFormats.map((format) => {
      return {
        label: format.label,
        url: this.getExportFormatUrl(format),
        disabled: !this.canExport(format),
        disabled_message: this.exportInfoMessage
      };
    });
  }

  /**
   * Get export format url.
   * @param format - export format object
   * @return formatted url for an export format.
   */
  getExportFormatUrl(format: any) {
    const queryParams = Object.keys(this.activatedRoute.snapshot.queryParams);
    // TODO: maybe we can use URLSerializer to build query string
    const baseUrl = format.endpoint
      ? format.endpoint
      : this.apiService.getEndpointByType(this._currentIndex());
    let url = `${baseUrl}?q=${encodeURIComponent(this.q)}&format=${format.format}`;

    // check if max rest result size is disabled
    if (!format.disableMaxRestResultsSize) {
      url += `&size=${RecordService.MAX_REST_RESULTS_SIZE}`;
    }
    // preFilters
    if (this.config && this.config.preFilters) {
      for (const [key, value] of Object.entries(this.config.preFilters)) {
        // force value to an array
        const values = (!Array.isArray(value)) ? [value] : value;
        values.map(v => {
          // We check whether the parameter exists in the current url.
          // If it does, we don't add the preFilter parameter.
          if (!queryParams.includes(key)) {
            url += `&${key}=${v}`;
          }
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
      : 0 < this.total && this.total < RecordService.MAX_REST_RESULTS_SIZE;
  }

  /**
   * Check if a record can be updated
   * @param record - object, record to check
   * @return Observable
   */
  canUpdateRecord$(record: object): Observable<ActionStatus> {
    return this.recordUiService.canUpdateRecord$(record, this.currentType);
  }

  /**
   * Check if a record can be deleted
   * @param record - object, record to check
   * @return Observable
   */
  canDeleteRecord$(record: object): Observable<ActionStatus> {
    return this.recordUiService.canDeleteRecord$(record, this.currentType);
  }

  /**
   * Check if a record can be used
   * @param record - object, record to check
   * @return Observable
   */
  canUseRecord$(record: object): Observable<ActionStatus> {
    return this.recordUiService.canUseRecord$(record, this.currentType);
  }

  /**
   * Filter the aggregations with given configuration function.
   * If no configuration is given, return the original aggregations.
   * @param records - Result records
   * @return Observable containing aggregations corresponding to actual records.
   */
  aggregations$(aggregations: object): Observable<any> {
    if (this.config.aggregations) {
      return this.config.aggregations(aggregations);
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

    if (!this.config.canRead) {
      return of(url);
    }

    return this.recordUiService.canReadRecord$(record, this.currentType).pipe(
      map((status: ActionStatus) => {
        if (status.can === false) {
          return null;
        }

        return url;
      })
    );
  }

  searchInField(event: DropdownChangeEvent): void {
    const selectedField = event.value;
    this.searchFields = this.searchFields.map((item: SearchField) => {
      if (selectedField && item.path === selectedField.path) {
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

  onChangeSearchFilter(event: IChecked): void {
    const values = [];
    if (event.filterKey === 'simple') {
          values.push(event.checked ? '0' : '1');
        }
    else if (event.checked) {
            values.push(String(event.checked))
          }
    this.recordSearchService.updateAggregationFilter(event.filterKey, values);
  }

  /**
   * Check if a filter is selected.
   *
   * @param filter SearchFilter
   * @returns true if the given filter is selected.
   */
  isFilterActive(filter: SearchFilter): boolean {
    return (this.aggregationsFilters)
      ? this.aggregationsFilters.some((item: any) => item.key === filter.filter && item.values.includes(String(filter.value)))
      : false;
  }

  /**
   * Load buckets for the given aggregation.
   * @param event - Object outputted when an aggregation is clicked.
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
        // Required to fire onChange event
        this.aggregations = [...this.aggregations];
        this.spinner.hide();
      });

    });
  }

  /**
   * Search for records.
   * @param size - number : force the number of records to return. If `null` the default component `size` attribute will be used.
   */
  protected _getRecords(size: number = null): Observable<any> {
    // Build query string
    const q = this._buildQueryString();

    // Empty search is not allowed and query is empty, search in backend is not
    // processed.
    if (this.config.allowEmptySearch === false && !q) {
      this.showEmptySearchMessage = true;
      return of({ hits: { hits: [], total: 0 }, aggregations: {} });
    } else {
      this.showEmptySearchMessage = false;
    }

    this.spinner.show();
    // Check remove filter from preFilters if it is already present in
    // the aggs filters.
    const preFilters = {};
    const aggsKeys = [];
    this.aggregationsFilters.map(agg => aggsKeys.push(agg.key));
    for (const [key, value] of Object.entries(this.config.preFilters || {})) {
      if (!(aggsKeys.includes(key))) {
        preFilters[key] = value;
      }
    }

    return this.recordService.getRecords(
      this._currentIndex(),
      q,
      this.page,
      size || this.size,
      this.aggregationsFilters || [],
      preFilters,
      this.config.listHeaders || null,
      this.sort,
      this._getFacetsParameter()
    );
  }


  /**
   * Emit new parameters when a search is done.
   */
  protected _emitNewParameters() {
    this.parametersChanged.emit({
      q: this.q,
      page: this.page,
      size: this.size,
      currentType: this.config.key,
      index: this.config.index,
      aggregationsFilters: this.aggregationsFilters,
      sort: this.sort
    });
  }

  /**
   * Get configuration for the current resource type.
   * @param type Type of resource
   */
  protected _loadConfigurationForType(type: string) {
    const q = this._buildQueryString();
    this.config = this.recordUiService.getResourceConfig(type);
    this.recordUiService.canAddRecord$(type).subscribe((result: ActionStatus) => {
      this.addStatus = result;
    });

    this._loadSearchFields();

    // Build aggregations.
    if (this.config.aggregationsOrder) {
      if (!isObservable(this.config.aggregationsOrder)) {
        this.config.aggregationsOrder = of(this.config.aggregationsOrder);
      }
    } else {
      this.config.aggregationsOrder = of([]);
    }

    // reset aggregations
    this.aggregations = null;

    // Sort options
    this._setDefaultSort();

    // load search filters
    this.searchFilters = this.config.searchFilters || [];

    // load export options
    this.exportOptions = this._exportFormats();

    // Update filters with default search filters only if the q parameter is empty
    if ((q === null || q.trim().length === 0) && this.config.defaultSearchInputFilters) {
      this.config.defaultSearchInputFilters.forEach((filter: { key: string, values: any[]}) => {
        this.recordSearchService.updateAggregationFilter(filter.key, filter.values);
      });
    }
  }

  /**
   * Get Resource config
   * @param paramName - Name of parameter
   * @param defaultValue - Default value is returned if the parameter is not defined
   * @return A config value or the given default value instead
   */
<<<<<<< HEAD
  protected _getResourceConfig(paramName: string, defaultValue: any) {
    return (paramName in this._config) ? this._config[paramName] : defaultValue;
=======
  private _getResourceConfig(paramName: string, defaultValue: any) {
    return (paramName in this.config) ? this.config[paramName] : defaultValue;
>>>>>>> 06d34b1 (refactor: primeng)
  }

  /**
   * Serialize all the search parameters with JSON.stringify method.
   * @return The serialized string.
   */
  protected _serializeSearchParameters(): SearchParams {
    return {
      currentType: this.config.key,
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
  protected _loadSearchFields(): void {
    // No search fields, reset previous stored and return.
    if (!this.config.searchFields) {
      this.searchFields = [];
      return;
    }

    // Store search fields.
    this.searchFields = this.config.searchFields.map((field: SearchField) => {
      field.label = this.translateService.instant(field.label);
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
  protected _buildQueryString(): string {
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
<<<<<<< HEAD
  protected _currentIndex() {
    if (this._config == null) {
=======
  private _currentIndex() {
    if (this.config == null) {
>>>>>>> 06d34b1 (refactor: primeng)
      return null;
    }
    return this.config.index || this.config.key;
  }

  /**
   * Get personalized name for current aggregation
   * @param key - string, aggregation key
   * @return string or null
   */
<<<<<<< HEAD
  protected _aggregationName(key: string): string | null {
    return this._config.aggregationsName && key in this._config.aggregationsName
      ? this._config.aggregationsName[key]
=======
  private _aggregationName(key: string): string | null {
    return this.config.aggregationsName && key in this.config.aggregationsName
      ? this.config.aggregationsName[key]
>>>>>>> 06d34b1 (refactor: primeng)
      : null;
  }

  /**
   * Extract persistent search filters on current url
   * @return Array of aggregations filter
   */
  protected _extractPersistentAggregationsFilters(): Array<AggregationsFilter> {
    const persistent = [];
    this._flatSearchFilters().filter(filter => filter.persistent === true)
        .forEach((filter: SearchFilter) => {
          if (this.activatedRoute.snapshot.queryParams.hasOwnProperty(filter.filter)) {
            const data = this.activatedRoute.snapshot.queryParams[filter.filter];
            persistent.push({
              key: filter.filter,
              values: Array.isArray(data) ? data : [data]
            });
          }
        });
    return persistent;
  }

  /**
   * Make all search filters on same array level
   * @returns - A filters array
   */
  protected _flatSearchFilters(): SearchFilter[] {
    const flatFilters = [];
    this.searchFilters.forEach((searchFilter: any) => {
      if (searchFilter.filters) {
        searchFilter.filters.forEach((filter: any) => flatFilters.push(filter))
      } else {
        flatFilters.push(searchFilter);
      }
    });
    return flatFilters;
  }

  /**
   * Map aggregation records data to corresponding aggregation.
   *
   * @param aggregation Aggregation object.
   * @param recordsAggregation Aggregation retrieved from record.
   */
  protected _mapAggregation(aggregation: Aggregation, recordsAggregation: any): void {
    aggregation.doc_count = recordsAggregation.doc_count || null;
    aggregation.type = recordsAggregation.type || 'terms';
    aggregation.config = recordsAggregation.config || null;
    if (!aggregation.name && recordsAggregation.name) {
      aggregation.name = recordsAggregation.name;
    }
    if(recordsAggregation.buckets) {
      aggregation.value.buckets = recordsAggregation.buckets;
      if (recordsAggregation.doc_count != null) {
        aggregation.doc_count = recordsAggregation.doc_count;
      }
      aggregation.value.buckets.map(bucket => this.processBuckets(bucket, aggregation.key));
    }
    aggregation.loaded = true;

  }

  /**
   * Enrich the bucket with several properties: indeterminate, parent, aggregationKey.
   *
   * @param bucket elastic bucket to process
   * @param aggregationKey bucket parent key
   * @returns the indeterminate state of the bucket
   */
  processBuckets(bucket, aggregationKey): boolean {
    // checkbox indeterminate state
    bucket.indeterminate = false;
    bucket.aggregationKey = aggregationKey;
    for (const k of Object.keys(bucket).filter(key => bucket[key].buckets)) {
      for (const childBucket of bucket[k].buckets) {
          // store the parent: useful to remove parent filters
          childBucket.parent = bucket;
          // store the aggregation key as we re-organize the bucket structure
          bucket.indeterminate ||= this.recordSearchService.hasFilter(k, childBucket.key);
          // do not change the order of the boolean expression to force processBucket over all
          // recursion steps
          bucket.indeterminate = this.processBuckets(childBucket, k) || bucket.indeterminate;
        }
    }
    return bucket.indeterminate;
  }

  /**
   * Compile facets keys to get only 'included' facets or having a filter selected.
   * @returns List of facets.
   */
  protected _getFacetsParameter(): Array<string> {
    const facets = [];
    this.aggregations.forEach((agg: any) => {
      if (agg.included === true || agg.expanded || this.aggregationsFilters.some((filter: any) => filter.key === agg.key)) {
        facets.push(agg.key);
      }
    });
    return facets;
  }

  /** Set the default sort. */
  protected _setDefaultSort(): void {
    if (this.sort != null) {
      return;
    }
    if (this.config.sortOptions) {
      const defaultSortValue = this.q ? 'defaultQuery' : 'defaultNoQuery';
      this.config.sortOptions.forEach((option: SortOption) => {
        if (option[defaultSortValue] === true) {
          this.sort = option.value;
        }
      });
    }
  }

  /**
   * Show the filter's section
   * @param searchFilterSection - Collection of filter
   * @returns true if the filter's section is show
   */
  showFilterSection(searchFilterSection: SearchFilterSection): boolean {
    return searchFilterSection.filters.some(
      (filter: SearchFilter) => {
        return this.config.allowEmptySearch ? true : (this.q && filter.showIfQuery === true) || !filter?.showIfQuery;
      }
    );
  }

  /**
   * Show the filter
   * @param searchFilter - search Filter
   * @returns true if the filter is show
   */
  showFilter(searchFilter: SearchFilter) {
    if (this.config.allowEmptySearch) {
      return true;
    }
    if (!this.q) {
      return !(searchFilter.showIfQuery === true);
    } else {
      return (searchFilter.showIfQuery === true || !searchFilter?.showIfQuery);
    }
  }

  paginatorChange(event: ChangeEvent): void {
    this.page = ++event.page;
    this.size = event.rows;
    this._searchParamsHasChanged(false);
  }
}
