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
import { Component, ElementRef, ViewChild, effect, input, output } from '@angular/core';

@Component({
    selector: 'ng-core-search-input',
    templateUrl: './search-input.component.html',
    standalone: false
})
export class SearchInputComponent {
  /** Input Id */
  inputId = input<string>('search');

  /** Display label */
  displayLabel = input<boolean>(false);

  /** Placeholder */
  placeholder = input<string>('search');

  /** Value to search */
  searchText = input<string>('');

  /** Remove trailing and leading spaces if true */
  trimQueryString = input<boolean>(true);

  /** Disabled attribute of search input */
  disabled = input<boolean>(false);

  /** Make the focus on field */
  focus = input<boolean>(false);

  /** Search value event */
  search = output<string>();

  /** Search input reference */
  @ViewChild('searchInput') input: ElementRef;

  constructor() {
    effect(() => {
      if (this.focus() && this.input?.nativeElement) {
        this.input.nativeElement.focus();
      }
    });
  }

  /**
   * Start the search by pressing enter
   * or clicking on the lens.
   */
  doSearch(): void {
    const { value } = this.input.nativeElement;
    this.search.emit(this.trimQueryString() ? value.trim() : value);
  }
}
