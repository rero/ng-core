// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from '@angular/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { AutoFocus } from 'primeng/autofocus';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Button } from 'primeng/button';

@Component({
  selector: 'ng-core-search-input',
  templateUrl: './search-input.component.html',
  imports: [InputGroup, InputText, AutoFocus, InputGroupAddon, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
