// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { AutoFocus } from '@openng/optimus-ui/autofocus';
import { Button } from '@openng/optimus-ui/button';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';

@Component({
  selector: 'ng-core-search-input',
  templateUrl: './search-input.component.html',
  imports: [InputGroup, InputText, AutoFocus, InputGroupAddon, Button],
})
export class SearchInputComponent {
  /** Input Id */
  inputId = input<string>('search');

  /** Display label */
  displayLabel = input<boolean>(false);

  /** Placeholder */
  placeholder = input<string>('search');

  /** Value to search */
  searchText = input.required<string>();

  /** Remove trailing and leading spaces if true */
  trimQueryString = input<boolean>(true);

  /** Disabled attribute of search input */
  disabled = input<boolean>(false);

  /** Make the focus on field */
  focus = input<boolean>(false);

  /** Search value event */
  searchQuery = output<string>();

  /** Search input reference */
  readonly input = viewChild<ElementRef>('searchInput');

  constructor() {
    effect(() => {
      const inputValue = this.input();
      if (this.focus() && inputValue?.nativeElement) {
        inputValue.nativeElement.focus();
      }
    });
  }

  /**
   * Start the search by pressing enter
   * or clicking on the lens.
   */
  doSearch(): void {
    const { value } = this.input()?.nativeElement ?? {};
    this.searchQuery.emit(this.trimQueryString() ? value.trim() : value);
  }
}
