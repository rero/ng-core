// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  DOCUMENT,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { OverlayOptions } from '@openng/optimus-ui/api';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from '@openng/optimus-ui/autocomplete';
import { AutoFocus } from '@openng/optimus-ui/autofocus';
import { DomHandler } from '@openng/optimus-ui/dom';
import { combineLatest, map, Observable, Subject, switchMap } from 'rxjs';

import { CONFIG } from '../../../core';
import { removeChars } from '../../../core/utils/utils';
import { RecordService } from '../../service/record/record.service';
import {
  availableHeightBelow,
  capScrollHeight,
  SUGGESTIONS_MIN_HEIGHT,
  visibleBottom,
} from './search-autocomplete.utils';

export interface AutoCompleteRecordType {
  field: string;
  groupLabel?: string;
  index: string;
  maxSuggestions?: number;
  processSuggestions: (data: any, query?: string) => AutoCompleteData[];
  preFilters?: any;
  queryParams?: Record<string, string>;
  sort?: string;
}

export interface AutoCompleteData {
  iconClass?: string;
  index?: string;
  label: string;
  originalLabel?: string;
  value?: string;
  [key: string]: string | undefined;
}

@Component({
  selector: 'ng-core-search-autocomplete',
  template: `
    <p-autoComplete
      #autoComplete
      [overlayOptions]="overlayOptions"
      dropdownIcon="fa-solid fa-magnifying-glass"
      [dropdown]="true"
      dropdownMode="none"
      [class]="styleClass()"
      [inputStyleClass]="inputStyleClass()"
      [delay]="delay()"
      [group]="group"
      [minQueryLength]="minLength()"
      [placeholder]="placeholder()"
      [ngModel]="value()"
      [ngModelOptions]="{ standalone: true }"
      (ngModelChange)="currentValue = sanitize($event)"
      [scrollHeight]="panelScrollHeight()"
      [suggestions]="suggestions()"
      (completeMethod)="setSuggestionQuery($event)"
      (onSelect)="onSelectValue($event)"
      (onKeyUp)="search($event)"
      (onDropdownClick)="buttonClick()"
      [pAutoFocus]="true">
      <ng-template let-item #group>
        <div class="core:flex core:items-center" [ngClass]="groupClass()" [innerHTML]="item.label"></div>
      </ng-template>
      <ng-template let-item #item>
        @if (item?.iconClass) {
          <i [ngClass]="item.iconClass"></i>&nbsp;
        }
        <span
          class="core:break-words core:whitespace-normal"
          [innerHTML]="item.label"
          [title]="item.originalLabel ? item.originalLabel : ''"></span>
      </ng-template>
    </p-autoComplete>
  `,
  imports: [AutoComplete, FormsModule, AutoFocus, NgClass],
})
export class SearchAutocompleteComponent implements AfterViewInit {
  protected recordService: RecordService = inject(RecordService);
  private readonly window = inject(DOCUMENT).defaultView;

  // Input
  delay = input<number>(300);
  groupClass = input<string | undefined>('core:text-gray-400');
  inputStyleClass = input<string | undefined>('core:w-full');
  minLength = input<number>(3);
  placeholder = input<string>();
  recordTypes = input.required<AutoCompleteRecordType[]>();
  scrollHeight = input<string>(CONFIG.DEFAULT_SELECT_SCROLL_HEIGHT);
  styleClass = input<string | undefined>('core:w-full');
  value = input.required<string>();

  // Output
  searchQuery = output<string>();

  // Current value
  currentValue = '';

  // Whether to display options as grouped when nested options are provided.
  group = false;
  overlayOptions: OverlayOptions = {};

  readonly autoComplete = viewChild<AutoComplete>('autoComplete');

  /** Height left below the input in the visible area, on touch devices only. */
  private readonly availableHeight = signal<number | undefined>(undefined);

  /** Scroll height of the suggestion panel, capped so that it fits below the input. */
  readonly panelScrollHeight = computed(() => capScrollHeight(this.scrollHeight(), this.availableHeight()));

  // User Query
  private query = new Subject<string>();

  buttonClick() {
    this.searchQuery.emit(this.currentValue);
  }

  suggestions = toSignal<any[], any[]>(this.query.pipe(switchMap((query: string) => this.getSuggestions(query))), {
    initialValue: [],
  });

  setSuggestionQuery(event: AutoCompleteCompleteEvent): void {
    this.updateAvailableHeight();
    this.query.next(event.query);
  }

  onSelectValue(event: AutoCompleteSelectEvent) {
    this.searchQuery.emit(event.value);
  }

  search(event: KeyboardEvent) {
    if (event?.key === 'Enter') {
      this.searchQuery.emit(this.currentValue);
    }
  }

  calculateWidth() {
    let width = 200;
    const autoComplete = this.autoComplete();
    if (autoComplete) {
      width = DomHandler.getOuterWidth(autoComplete.el.nativeElement);
    }
    this.overlayOptions = {
      contentStyle: { width: width * 1 + 'px' },
    };
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateWidth();
  }

  /**
   * On a touch device, the virtual keyboard hides the bottom of the page. The
   * suggestion panel, too tall to fit above or below the input, is then pinned
   * at the top of the page and hides the input. Cap its height to the space left
   * below the input, after scrolling the input to the top of the screen if this
   * space is too small.
   */
  private updateAvailableHeight(): void {
    const { window } = this;
    const element: HTMLElement | undefined = this.autoComplete()?.el.nativeElement;
    if (!window || !element || !window.matchMedia?.('(pointer: coarse)').matches) {
      return;
    }
    let height = availableHeightBelow(element.getBoundingClientRect().bottom, visibleBottom(window));
    if (height < SUGGESTIONS_MIN_HEIGHT) {
      element.scrollIntoView({ block: 'start' });
      height = availableHeightBelow(element.getBoundingClientRect().bottom, visibleBottom(window));
    }
    this.availableHeight.set(height);
  }

  ngAfterViewInit() {
    this.calculateWidth();
  }

  sanitize(value: string): string {
    if (!value) {
      return value;
    }
    const re = new RegExp('<[^>]*>', 'g');
    return value.replace(re, '');
  }

  private getSuggestions(
    query: string,
  ): Observable<AutoCompleteData[][] | { label: string; items: AutoCompleteData[] }[]> {
    return combineLatest(this.prepareQuery(query)).pipe(
      map((data: AutoCompleteData[][]) => {
        if (data.length > 1) {
          this.group = true;
          return data
            .map((hits) => {
              if (hits.length > 0) {
                const selectedRecordType = this.recordTypes().find(
                  (type: AutoCompleteRecordType) => type.index === hits[0].index,
                );
                if (selectedRecordType && !('groupLabel' in selectedRecordType)) {
                  throw new Error('Missing groupLabel definition');
                }
                return {
                  label: selectedRecordType?.groupLabel ?? '',
                  items: hits,
                };
              }
            })
            .filter((item): item is { label: string; items: AutoCompleteData[] } => item !== undefined);
        } else {
          // Only one category, no grouping
          return [data[0]];
        }
      }),
    );
  }

  private prepareQuery(query: string): Observable<AutoCompleteData[]>[] {
    query = removeChars(query);
    return this.recordTypes().map((recordType: AutoCompleteRecordType) => {
      const queryParams: string[] = [];
      if (recordType?.queryParams) {
        Object.keys(recordType.queryParams).forEach((key) => {
          queryParams.push(`${key}:${recordType.queryParams![key].replace(':', '\\:')}`);
        });
      }
      let queryRecord = `${recordType.field}:${query}`;
      if (queryParams.length > 0) {
        queryRecord += ` AND ${queryParams.join(' AND ')}`;
      }
      return this.recordService
        .getRecords(recordType.index, {
          query: queryRecord,
          itemsPerPage: recordType.maxSuggestions || 10,
          preFilters: recordType.preFilters || {},
          sort: recordType.sort || '',
        })
        .pipe(map((data: any) => recordType.processSuggestions(data, query)));
    });
  }
}
