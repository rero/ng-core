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
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { JSONSchema7 } from 'json-schema';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import { Error } from '../../error/error';
import { ActionStatus } from '../action-status';
import { Record, SearchField } from '../record';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { AggregationsFilter, RecordSearchService } from './record-search.service';

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
    component?: Component,
    total?: number,
    canAdd?: any,
    canUpdate?: any,
    canDelete?: any,
    canRead?: any,
    permissions?: any,
    aggregations?: any,
    listHeaders?: any,
    itemHeaders?: any,
    aggregationsOrder?: Array<string>,
    aggregationsExpand?: Array<string>,
    aggregationsBucketSize?: number,
    showSearchInput?: boolean,
    pagination?: {
      boundaryLinks?: boolean,
      maxSize?: number
    },
    formFieldMap?: (field: FormlyFieldConfig, jsonSchema: JSONSchema7) => FormlyFieldConfig
  }[] = [{ key: 'documents', label: 'Documents' }];

  /**
   * Custom URL to notice detail
   */
  @Input()
  detailUrl: string = null;

  /**
   * Current aggregations filters applied
   */
  aggregationsFilters: Array<AggregationsFilter> = null;

  /**
   * Contain result row data
   */
  hits: any = [];

  /**
   * Facets retreived from request result
   */
  aggregations: Array<{ key: string, bucketSize: any, value: { buckets: [] } }>;

  /**
   * Error message when something wrong happend during a search
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
   * JSON stringified of last search parameters. Used for checking if we have
   * to do a search or not.
   */
  private _lastSearchParameters: string = null;

  /**
   * Define if search input have to be displayed or not.
   */
  private _showSearchInput = true;

  /**
   * Define if title have to be displayed or not.
   */
  private _showLabel = true;

  /**
   * Store configuration for type
   */
  private _config: any = null;

  /**
   * Subscription to aggregationsFilters observable
   */
  private _aggregationsFiltersSubscription: Subscription;

  /**
   * Output current state when parameters change.
   */
  @Output() parametersChanged = new EventEmitter<any>();

  /**
   * Constructor.
   *
   * @param _recordService Record service.
   * @param _recordUiService Record UI service.
   * @param _recordSearchService Record search service.
   * @param _translateService Translate service.
   * @param _spinner Spinner service.
   * @param _apiService Api service.
   */
  constructor(
    private _recordService: RecordService,
    private _recordUiService: RecordUiService,
    private _recordSearchService: RecordSearchService,
    private _translateService: TranslateService,
    private _spinner: NgxSpinnerService,
    private _apiService: ApiService
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
    this._aggregationsFiltersSubscription = this._recordSearchService.aggregationsFilters.subscribe(
      (aggregationsFilters: Array<AggregationsFilter>) => {
        // No aggregations filters are set at this time, we do nothing.
        if (aggregationsFilters === null) {
          return;
        }

        // Detects if it's the first change. This allows to know if the page
        // have to be resetted.
        const firstChange = this.aggregationsFilters === null;

        this.aggregationsFilters = aggregationsFilters;

        // Search parameters have not changed, useless to do a search
        if (this.haveSearchParametersChanged() === false) {
          return;
        }

        this._getRecords(firstChange === false);
      }
    );

    // Load totals for each resource type
    for (const type of this.types) {
      this._recordService.getRecords(
        type.key, '', 1, 1, [],
        this._config.preFilters || {},
        this._config.listHeaders || null).subscribe((records: Record) => {
          type.total = this._recordService.totalHits(records.hits.total);
        });
    }
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
      if (this._config === null || changes.currentType.currentValue !== this._config.key) {
        this.loadConfigurationForType(this.currentType);
      }
    }

    // If it's the first change, we don't do a search, it's delegated to the
    // aggregations filters subscription.
    if (changes[Object.keys(changes)[0]].firstChange === false && this.haveSearchParametersChanged() === true) {
      // Get records and reset page only if page has not changed
      this._getRecords('page' in changes === false);
    }
  }

  /**
   * Component destruction.
   *
   * Unsubscribes from the observable of the aggregations filters.
   */
  ngOnDestroy() {
    this._aggregationsFiltersSubscription.unsubscribe();
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
    const paginationConfig = this.getResourceConfig('pagination', {});
    return ('boundaryLinks' in paginationConfig) ? paginationConfig.boundaryLinks : false;
  }

  /**
   * Number of pages showed on pagination
   */
  get paginationMaxSize(): number {
    const paginationConfig = this.getResourceConfig('pagination', {});
    return ('maxSize' in paginationConfig) ? paginationConfig.maxSize : 5;
  }

  /**
   * Contain result data
   *
   * @return list of metadata results.
   */
  get records(): Array<any> {
    return this.hits && this.hits.hits ? this.hits.hits : [];
  }

  /**
   * Total of records corresponding to request
   *
   * @return integer representing the number of results.
   */
  get total(): number {
    return this.hits && this.hits.total ? this._recordService.totalHits(this.hits.total) : 0;
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
    return this._translateService.stream('{{ total }} results', { total: this.total });
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
    this._getRecords(false);
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
   * Change number of items per page value.
   * @param event - Event, dom event triggered
   * @param size - number, new page size
   */
  changeSize(event: Event, size: number) {
    event.preventDefault();
    this.size = size;
    this._getRecords();
  }

  /**
   * Change query text.
   * @param event - string, new query text
   */
  searchByQuery(event: string) {
    this.q = event;
    this.aggregationsFilters = [];
    this._getRecords();
    this._recordSearchService.setAggregationsFilters([]);
  }

  /**
   * Change type of records.
   * @param event - Event, dom event triggered
   * @param type - string, type of resource
   */
  changeType(event: Event, type: string) {
    event.preventDefault();

    this.currentType = type;
    this.loadConfigurationForType(this.currentType);
    this.aggregationsFilters = [];
    this._getRecords();
    this._recordSearchService.setAggregationsFilters([]);
  }

  /**
   * Delete a record by its PID.
   * @param pid - string, PID to delete
   */
  deleteRecord(pid: string) {
    this._recordUiService.deleteRecord(this.currentType, pid).subscribe((result) => {
      if (result === true) {
        // refresh records
        this._getRecords(true, false);

        // update main counter
        this._config.total--;
      }
    });
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
   * @param format - string, export format
   * @return formatted url for an export format.
   */
  getExportFormatUrl(format: string) {
    const baseUrl = this._apiService.getEndpointByType(this.currentType);
    let url = `${baseUrl}?q=${this.q}&format=${format}&size=${RecordService.MAX_REST_RESULTS_SIZE}`;
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
   * Aggregations order (facets)
   * @param aggr - Aggregations dictonary
   * @return Array of aggregation, eventually re-ordered.
   */
  aggregationsOrder(aggr: any): Array<any> {
    // TODO: replace 'value' by buckets directly and merge and rename aggregationOrders and aggregationsFilters
    // to postProcessAggregations in route configuration
    const aggregations = [];
    const bucketSize = ('aggregationsBucketSize' in this._config) ? this._config.aggregationsBucketSize : null;
    if ('aggregationsOrder' in this._config) {
      this._config.aggregationsOrder.forEach((key: string) => {
        if (key in aggr) {
          aggregations.push({
            key,
            bucketSize,
            value: { buckets: aggr[key].buckets },
            type: aggr[key].type || 'terms',
            config: aggr[key].config || null
          });
        }
      });
    } else {
      Object.keys(aggr).forEach((key: string) => {
        aggregations.push({
          key,
          bucketSize,
          value: { buckets: aggr[key].buckets },
          type: aggr[key].type || 'terms',
          config: aggr[key].config || null
        });
      });
    }
    return aggregations;
  }

  /**
   * Show or hide facet section
   * @param key facet key
   * @return Boolean
   */
  expandFacet(key: string): boolean {
    const expandConfig = ('aggregationsExpand' in this._config) ? this._config.aggregationsExpand : [];
    if (expandConfig.indexOf(key) === -1) {
      return false;
    }
    return true;
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
    const url = { link: `detail/${record.metadata.pid}`, external: false };

    if (this.detailUrl) {
      url.link = this.detailUrl.replace(':type', this.currentType).replace(':pid', record.metadata.pid);
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
   * Search for records.
   * @param resetPage If page needs to be resetted to 1.
   * @param emitParameters If parameters have to be emitted in parents.
   */
  private _getRecords(resetPage: boolean = true, emitParameters: boolean = true) {
    this._lastSearchParameters = this._serializeSearchParameters();

    if (resetPage === true) {
      this.page = 1;
    }

    this._spinner.show();

    // Build query string
    const q = this._buildQueryString();

    this._recordService.getRecords(
      this.currentType,
      q,
      this.page,
      this.size,
      this.aggregationsFilters,
      this._config.preFilters || {},
      this._config.listHeaders || null,
      this.sort
    ).subscribe(
      (records: Record) => {
        this.hits = records.hits;
        this.aggregations$(records.aggregations).subscribe((aggr: any) => {
          this.aggregations = this.aggregationsOrder(aggr);
        });

        this._spinner.hide();

        if (emitParameters) {
          this.emitNewParameters();
        }
      },
      (error) => {
        this.error = error;
        this._spinner.hide();
      }
    );
  }


  /**
   * Emit new parameters when a search is done.
   */
  private emitNewParameters() {
    this.parametersChanged.emit({
      q: this.q,
      page: this.page,
      size: this.size,
      currentType: this.currentType,
      aggregationsFilters: this.aggregationsFilters,
      sort: this.sort
    });
  }

  /**
   * Get configuration for the current resource type.
   * @param type Type of resource
   */
  private loadConfigurationForType(type: string) {
    this._config = this._recordUiService.getResourceConfig(type);
    this._recordUiService.canAddRecord$(type).subscribe((result: ActionStatus) => {
      this.addStatus = result;
    });

    this._loadSearchFields();
  }

  /**
   * Get Resource config
   * @param paramName - Name of parameter
   * @param defaultValue - Default value is returned if the parameter is not defined
   * @return A config value or the given default value instead
   */
  private getResourceConfig(paramName: string, defaultValue: any) {
    return (paramName in this._config) ? this._config[paramName] : defaultValue;
  }

  /**
   * Check if search parameters have changed since last search, by comparing
   * JSON strings.
   * @return Boolean
   */
  private haveSearchParametersChanged(): boolean {
    const params = this._serializeSearchParameters();

    if (this._lastSearchParameters !== params) {
      this._lastSearchParameters = params;
      return true;
    }

    return false;
  }

  /**
   * Serialize all the search parameters with JSON.stringify method.
   * @return The serialized string.
   */
  private _serializeSearchParameters(): string {
    // Order aggregations filters for comparison
    this.aggregationsFilters.forEach((item, key) => {
      this.aggregationsFilters[key].values = item.values.sort();
    });

    return JSON.stringify({
      currentType: this.currentType,
      q: this.q,
      page: this.page,
      size: this.size,
      sort: this.sort,
      aggregationsFilters: this.aggregationsFilters
    });
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
}
