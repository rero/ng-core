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

import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable, Observer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RemoteTypeaheadService } from './remote-typeahead.service';


@Component({
  selector: 'ng-core-remote-typeahead',
  templateUrl: './remote-typeahead.component.html'
})
export class RemoteTypeaheadComponent extends FieldType implements OnInit {

  /** Input search string */
  search: string;

  /** Loading data */
  typeaheadLoading: boolean;

  /** Observable on Suggestions Metadata */
  suggestions$: Observable<Array<SuggestionMetadata>>;

  /** Template representation of the formControl value. */
  valueAsHTML$: Observable<string>;

  /** Number of result in suggestions list */
  private _numberOfSuggestions = 10;

  /** Remote Typeahead options from the JONSchema */
  private get _rtOptions(): object {
    return this.field.templateOptions.remoteTypeahead;
  }

  /**
   * Constructor
   * @param _remoteTypeaheadService - RemoteTypeaheadService
   */
  constructor(
    private _remoteTypeaheadService: RemoteTypeaheadService
  ) {
    super();
  }

  /** Init */
  ngOnInit() {

    // get the list of suggestions based on input search changes
    this.suggestions$ = new Observable((observer: Observer<string>) => {
      observer.next(this.search);
    }).pipe(
      switchMap((query: string) => {
        return this._remoteTypeaheadService.getSuggestions(this._rtOptions, query, this._numberOfSuggestions);
      })
    );

    // get the template version of the formControl value
    this.valueAsHTML$ = new Observable((observer: Observer<string>) => {
      observer.next(this.formControl.value);
    }).pipe(
      switchMap((value: string) => {
        return this._remoteTypeaheadService.getValueAsHTML(this._rtOptions, value);
      })
    );
  }

  /**
   * Return the group field when the suggestion as grouped by category.
   * @returns string - the name of the field in suggestion list containing the group category. null for disabled.
   */
  get groupField(): string | null {
    const enableGF = this._remoteTypeaheadService.enableGroupField(this._rtOptions);
    return enableGF ? 'group' : null;
  }

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
   * Clear current value
   */
  clear(): void {
    this.search = null;
    this.formControl.reset();
    this.field.focus = true;
  }
}

/** Suggestion Metadata Interface */
export interface SuggestionMetadata {
  label: string;
  value: string;
  externalLink?: string;
  group?: string;
}
