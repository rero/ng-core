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
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'ng-core-record-search-page',
  templateUrl: './record-search-page.component.html',
  styles: []
})
export class RecordSearchComponent implements OnInit {
  /**
   * Current filters applied
   */
  aggFilters = [];

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
  adminMode = true;

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
   * Types of resources available
   */
  types: {
    key: string,
    label: string,
    component?: Component,
    total?: number,
    canAdd?: any,
    canUpdate?: any,
    canDelete?: any,
    canRead?: any,
    aggregations?: any
  }[] = [{ key: 'documents', label: 'Documents' }];

  /**
   * Constructor
   * @param dialogService - Modal component
   * @param recordService - Service for managing records
   * @param toastService - Toast message
   * @param route - Angular current route
   * @param router - Angular router
   */
  constructor(
    private route: ActivatedRoute,
    protected router: Router
  ) { }

  /**
   * Component initialisation.
   */
  ngOnInit() {
    combineLatest(this.route.paramMap, this.route.queryParamMap).subscribe(([paramMap, queryParams]) => {
      // store current type of resource
      this.currentType = paramMap.get('type');

      // store query parameters
      if (queryParams.has('q')) {
        this.q = queryParams.get('q');
      }

      if (queryParams.has('size')) {
        this.size = +queryParams.get('size');
      }

      if (queryParams.has('page')) {
        this.page = +queryParams.get('page');
      }

      // loop over all aggregation filters
      queryParams.keys.forEach((key: string) => {
        if (['q', 'page', 'size'].includes(key) === false) {
          const values = queryParams.getAll(key);
          const index = this.aggFilters.findIndex(item => item.key === key);

          if (index !== -1) {
            this.aggFilters[index] = { key, values };
          } else {
            this.aggFilters.push({ key, values });
          }
        }
      });
    });

    // Store configuration data
    const data = this.route.snapshot.data;
    if (data.types) {
      this.types = data.types;
    }

    if (typeof data.showSearchInput !== 'undefined') {
      this.showSearchInput = data.showSearchInput;
    }

    if (typeof data.adminMode !== 'undefined') {
      this.adminMode = data.adminMode;
    }

    if (data.detailUrl) {
      this.detailUrl = data.detailUrl;
    }
  }

  /**
   * Update URL accordingly to parameters given.
   * @param parameters Parameters to put in url or query string
   */
  updateUrl(parameters: any) {
    const queryParams: any = {
      q: parameters.q,
      page: parameters.page,
      size: parameters.size
    };

    for (const filter of parameters.aggFilters) {
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
  private getCurrentUrl(type: string): string {
    const segments = this.router.parseUrl(this.router.url).root.children.primary.segments.map(it => it.path);
    segments[segments.length - 1] = type;

    return '/' + segments.join('/');
  }
}
