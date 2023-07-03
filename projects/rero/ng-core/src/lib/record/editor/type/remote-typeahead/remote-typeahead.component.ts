/*
 * RERO angular core
 * Copyright (C) 2019-2023 RERO
 * Copyright (C) 2019-2023 UCLouvain
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
import { ActivatedRoute } from '@angular/router';
import { FieldType } from '@ngx-formly/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable, Observer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RemoteTypeaheadService } from './remote-typeahead.service';

@Component({
  selector: 'ng-core-remote-typeahead',
  styles: ['.dropdown-item:hover{ cursor:pointer;}'],
  templateUrl: './remote-typeahead.component.html'
})
export class RemoteTypeaheadComponent extends FieldType implements OnInit {

  // COMPONENT ATTRIBUTES =====================================================
  /** Input search string */
  search: string;
  /** Loading data */
  typeaheadLoading: boolean;

  /** Observable on Suggestions Metadata */
  suggestions$: Observable<Array<SuggestionMetadata | string>>;
  /** Template representation of the formControl value. */
  valueAsHTML$: Observable<string>;
  /** Number of result in suggestions list */
  private _numberOfSuggestions = 10;

  // GETTER & SETTER ==========================================================
  /** Filters options */
  get filters(): remoteTypeaheadFilters | null {
    return this._rtOptions?.filters;
  };

  /** Remote Typeahead options from the JONSchema */
  private get _rtOptions(): remoteTypeahead {
    return this.field.templateOptions.remoteTypeahead;
  }

  /**
   * Return the group field when the suggestion as grouped by category.
   * @returns string - the name of the field in suggestion list containing the group category. null for disabled.
   */
  get groupField(): string | null {
    return (this._remoteTypeaheadService.enableGroupField(this._rtOptions)) ? 'group' : null;
  }

  // CONSTRUCTOR & HOOKS ======================================================
  /**
   * Constructor
   * @param _remoteTypeaheadService - RemoteTypeaheadService
   * @param _route - Activated route
   */
  constructor(
    private _remoteTypeaheadService: RemoteTypeaheadService,
    private _route: ActivatedRoute
  ) {
    super();
  }

  /** Init */
  ngOnInit() {
    this._assignRemoteTypeaheadSelectedOptions();
    // get the list of suggestions based on input search changes
    this.suggestions$ = new Observable((observer: Observer<string>) => observer
        .next(this.search))
        .pipe(
          switchMap((query: string) => {
            return this._remoteTypeaheadService.getSuggestions(
              this._rtOptions,
              query,
              this._numberOfSuggestions,
              this._route.snapshot.params.pid || null
            );
          })
        );

    // get the template version of the formControl value
    this.valueAsHTML$ = new Observable((observer: Observer<string>) => observer
        .next(this.formControl.value))
        .pipe(
          switchMap((value: string) => this._remoteTypeaheadService.getValueAsHTML(this._rtOptions, value))
        );
  }

  // COMPONENT FUNCTIONS ======================================================
  /**
   * Change Typeahead loading.
   * @param e boolean
   */
  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  /**
   * Set the field value with the selected suggestion.
   * @param e - TypeaheadMatch
   */
  typeaheadOnSelect(e: TypeaheadMatch): void {
    if (e.item.value != null) {
      this.formControl.setValue(e.item.value);
    } else {
      this.formControl.get('$ref').reset();
    }
    this.search = null;
  }

  /**
   * Detection of change on the filter menu,
   * Value assignment and reset value on the search field.
   * @param filter - selected filter on select menu
   */
  changeFilter(filter: string): void {
    this.filters.selected = filter;
    this.search = null;
  }

  /** Clear current value */
  clear(): void {
    this.search = null;
    this.formControl.reset();
    this.field.focus = true;
  }

  /** Set the filter.selected default value. */
  private _assignRemoteTypeaheadSelectedOptions(): void {
    const rtOptions = this._rtOptions;
    if (rtOptions?.filters && rtOptions.filters?.default == null) {
      throw new Error('Default value is missing for filters.');
    }
    if (rtOptions.filters && rtOptions.filters?.default && rtOptions.filters?.selected == null) {
      rtOptions.filters.selected = rtOptions.filters.default;
    }
  }
}

/** Suggestion Metadata Interface */
export interface SuggestionMetadata {
  label: string;          // The master label of the suggestion
  description?:string;    // A small description to specify the suggestion label
  value: string;          // The value of the suggestion ($ref)
  externalLink?: string;  // (Optional) URL describing the suggestion
  group?: string;         // (Optional) The key to group suggestions
  column?: number;        // (Optional) The column number where to display the suggestion
}

/** remoteTypeahead interface */
export interface remoteTypeahead {
  enableGroupField: boolean;
  filters: remoteTypeaheadFilters;
}

/** Filters Interface */
export interface remoteTypeaheadFilters {
  itemCssClass?: string,
  default: string;
  selected: string;
  options: {
    label: string;
    value: string;
  }[]
}
