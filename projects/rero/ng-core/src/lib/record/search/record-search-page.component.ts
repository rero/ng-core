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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, Subscription } from 'rxjs';
import { ActionStatus } from '../action-status';
import { JSONSchema7 } from '../editor/editor.component';
import { RecordUiService } from '../record-ui.service';
import { SortOption } from './record-search.component';
import { RecordSearchService } from './record-search.service';

@Component({
  selector: 'ng-core-record-search-page',
  templateUrl: './record-search-page.component.html'
})
export class RecordSearchPageComponent implements OnInit, OnDestroy {
  /**
   * Current selected resource type
   */
  currentType = 'documents';

  /**
   * URL to notice detail
   */
  detailUrl: string = null;

  /**
   * Display search input
   */
  showSearchInput = true;

  /**
   * Admin mode (edit, remove, add, ...)
   */
  adminMode: ActionStatus = {
    can: true,
    message: ''
  };

  /**
   * Define the current record's page
   */
  page = 1;

  /**
   * Define the number of records per page
   */
  size = 10;

  /**
   * Search query
   */
  q = '';

  /**
   * Define the sort order of resulting records. It takes a string value
   * representing the property which is used to sort the records.
   * If a minus is put before the value, the sort is reversed.
   */
  sort: string = null;

  /**
   * Types of resources available
   */
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
    pagination?: {
      boundaryLinks?: boolean,
      maxSize?: number
    },
    formFieldMap?: (field: FormlyFieldConfig, jsonSchema: JSONSchema7) => FormlyFieldConfig
  }[] = [{ key: 'documents', label: 'Documents' }];

  /**
   * Subscription to route parameters observables
   */
  private _routeParametersSubscription: Subscription;

  /**
   * Constructor.
   *
   * @param _route Angular current route.
   * @param _router Angular router.
   * @param _recordSearchService Record search service.
   */
  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _recordSearchService: RecordSearchService,
    protected _recordUiService: RecordUiService
  ) { }

  /**
   * Component initialisation.
   *
   * Subscribes to changes of route parameters and query parameters for
   * updating the search parameters and sending them to child component
   * (RecordSearchComponent).
   */
  ngOnInit() {
    this._routeParametersSubscription = combineLatest([this._route.paramMap, this._route.queryParamMap]).subscribe(
      ([paramMap, queryParams]) => {
        // store current type of resource
        this.currentType = paramMap.get('type');
        this._recordUiService.types = this._route.snapshot.data.types;

        const config = this._recordUiService.getResourceConfig(this.currentType);

        // Stores query parameters
        this.q = queryParams.get('q') || '';
        this.size = queryParams.get('size') ? +queryParams.get('size') : 10;
        this.page = queryParams.get('page') ? +queryParams.get('page') : 1;
        this._setDefaultSort(config, queryParams.get('sort'));

        // loops over all aggregations filters and stores them.
        const aggregationsFilters = [];
        queryParams.keys.forEach((key: string) => {
          if (['q', 'page', 'size', 'sort'].includes(key) === false) {
            const values = queryParams.getAll(key);
            aggregationsFilters.push({ key, values });
          }
        });

        // Add filter parameter value
        if (config.searchFilters) {
          config.searchFilters.forEach((filter: any) => {
            if (queryParams.get(filter.filter) === null && filter.disabledValue) {
              aggregationsFilters.push({ key: filter.filter, values: [filter.disabledValue] });
            }
          });
        }
        // update the facet filters given the URL params
        this._recordSearchService.setAggregationsFilters(aggregationsFilters);
      }
    );

    // Store configuration data
    const data = this._route.snapshot.data;
    if (data.types) {
      this.types = data.types;
    }

    if (data.showSearchInput != null) {
      this.showSearchInput = data.showSearchInput;
    }

    if (data.adminMode) {
      data.adminMode().subscribe((as: ActionStatus) => this.adminMode = as);
    }

    if (data.detailUrl) {
      this.detailUrl = data.detailUrl;
    }
  }

  /**
   * Component destruction.
   *
   * Unsubscribes from the observables of the route parameters.
   */
  ngOnDestroy() {
    this._routeParametersSubscription.unsubscribe();
  }

  /**
   * Update URL accordingly to parameters given.
   * @param parameters Parameters to put in url or query string
   */
  updateUrl(parameters: any) {
    const queryParams: any = {
      q: parameters.q,
      page: parameters.page,
      size: parameters.size,
      sort: parameters.sort
    };
    for (const filter of parameters.aggregationsFilters) {
      // We need to loop over each value and insert it on beginning of the array
      // instead of assign values directly. Otherwise, angular router doesn't
      // detect the changes. It's certainly a bug in angular.
      queryParams[filter.key] = [];
      for (const value of filter.values) {
        queryParams[filter.key].unshift(value);
      }
    }
    this._router.navigate([this.getCurrentUrl(parameters.currentType)], { queryParams, relativeTo: this._route });
  }

  /**
   * Return current URL after removing query parameters and updating resource type.
   *
   * @returns Updated url without query string
   */
  protected getCurrentUrl(type: string): string {
    const segments = this._router.parseUrl(this._router.url).root.children.primary.segments.map(it => it.path);
    segments[segments.length - 1] = type;

    return '/' + segments.join('/');
  }

  /**
   * Sets the default sort for resource type.
   *
   * @param config Configuration object.
   */
  private _setDefaultSort(config: any, sortParam: string) {
    if (sortParam) {
      this.sort = sortParam;
      return;
    }

    this.sort = null;

    if (!config.sortOptions) {
      return;
    }

    const defaulSortValue = this.q ? 'defaultQuery' : 'defaultNoQuery';
    config.sortOptions.forEach((option: SortOption) => {
      if (option[defaulSortValue] === true) {
        this.sort = option.value;
      }
    });
  }
}
