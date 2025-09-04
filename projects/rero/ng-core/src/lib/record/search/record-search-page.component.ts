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
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MenuItem } from 'primeng/api';
import { combineLatest, Subscription } from 'rxjs';
import { ActionStatus } from '../action-status';
import { JSONSchema7 } from '../editor/utils';
import { RecordUiService } from '../record-ui.service';
import { RecordSearchService } from './record-search.service';

@Component({
    selector: 'ng-core-record-search-page',
    templateUrl: './record-search-page.component.html',
    standalone: false
})
export class RecordSearchPageComponent implements OnInit, OnDestroy {

  protected route: ActivatedRoute = inject(ActivatedRoute);
  protected router: Router = inject(Router);
  protected recordSearchService: RecordSearchService = inject(RecordSearchService);
  protected recordUiService: RecordUiService = inject(RecordUiService)

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
    canAdd?: ActionStatus,
    canUpdate?: ActionStatus,
    canDelete?: ActionStatus,
    canRead?: ActionStatus,
    permissions?: unknown,
    aggregations?: (aggs: object) => Observable<object> | object;
    preFilters?: Record<string, string | string[]>;
    listHeaders?: Record<string, string>;
    itemHeaders?: Record<string, string>;
    aggregationsName?: Record<string, string>;
    aggregationsOrder?: string[],
    aggregationsExpand?: string[] | (() => string[]),
    aggregationsBucketSize?: number,
    pagination?: {
      boundaryLinks?: boolean,
      maxSize?: number,
      pageReport?: boolean,
      rowsPerPageOptions?: number[],
    },
    formFieldMap?: (field: FormlyFieldConfig, jsonSchema: JSONSchema7) => FormlyFieldConfig
  }[] = [{ key: 'documents', label: 'Documents' }];

  /**
   * Subscription to route parameters observables
   */
  private routeParametersSubscription: Subscription;

  /**
   * Component initialization.
   *
   * Subscribes to changes of route parameters and query parameters for
   * updating the search parameters and sending them to child component
   * (RecordSearchComponent).
   */
  ngOnInit() {
    this.routeParametersSubscription = combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      ([paramMap, queryParams]) => {
        // store current type of resource
        this.currentType = paramMap.get('type');
        this.recordUiService.types = this.route.snapshot.data.types;

        const config = this.recordUiService.getResourceConfig(this.currentType);

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
        // Add filter parameter value
        if (config.searchFilters) {
          config.searchFilters.forEach((filter: SearchFilter | SearchFilterSection) => {
            if ("filter" in filter && queryParams.get(filter.filter) === null && filter.disabledValue) {
              aggregationsFilters.push({ key: filter.filter, values: [filter.disabledValue] });
        }
        });
        }

        // update the facet filters given the URL params
        this.recordSearchService.setAggregationsFilters(aggregationsFilters);
      }
    );

    // Store configuration data
    const { data } = this.route.snapshot;
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
    this.routeParametersSubscription.unsubscribe();
  }

  /**
   * Update URL accordingly to parameters given.
   * @param parameters Parameters to put in url or query string
   */
  updateUrl(parameters: SearchParams) {
     const queryParams: Record<string, string | number> = {
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
    this.router.navigate([this.getCurrentUrl(parameters.currentType)], { queryParams, relativeTo: this.route });
  }

  /**
   * Return current URL after removing query parameters and updating resource type.
   *
   * @returns Updated url without query string
   */
  protected getCurrentUrl(type: string): string {
    const segments = this.router.parseUrl(this.router.url).root.children.primary.segments.map(it => it.path);
    segments[segments.length - 1] = type;

    return '/' + segments.join('/');
  }

  /**
   * Sets the default sort for resource type.
   *
   * @param config Configuration object.
   */
  private _setDefaultSort(config: RecordTypeConfig, sortParam: string) {
    if (sortParam) {
      this.sort = sortParam;
      return;
    }

    this.sort = null;

    if (!config.sortOptions) {
      return;
    }

    const defaultSortValue = this.q ? 'defaultQuery' : 'defaultNoQuery';
    config.sortOptions.forEach((option: MenuItem) => {
      if (option[defaultSortValue] === true) {
        this.sort = option.value;
      }
    });
  }
}
