/*
 * RERO angular core
 * Copyright (C) 2024-2025 RERO
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
import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { OverlayOptions } from 'primeng/api';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { AutoFocus } from 'primeng/autofocus';
import { DomHandler } from 'primeng/dom';
import { combineLatest, map, Observable, Subject, switchMap } from 'rxjs';
import { CONFIG } from '../../../core';
import { removeChars } from '../../../core/utils/utils';
import { RecordService } from '../../service/record/record.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-autoComplete
      #autoComplete
      [overlayOptions]="overlayOptions"
      dropdownIcon="fa fa-search"
      [dropdown]="true"
      dropdownMode="none"
      [class]="styleClass()"
      [inputStyleClass]="inputStyleClass()"
      [delay]="delay()"
      [group]="group"
      [minQueryLength]="minLength()"
      [placeholder]="placeholder()"
      [ngModel]="value()"
      (ngModelChange)="currentValue = sanitize($event)"
      [scrollHeight]="scrollHeight()"
      [suggestions]="suggestions()"
      (completeMethod)="setSuggestionQuery($event)"
      (onSelect)="onSelectValue($event)"
      (onKeyUp)="search($event)"
      (onDropdownClick)="buttonClick()"
      [pAutoFocus]="true"
    >
      <ng-template let-item #group>
        <div class="core:flex core:items-center" [ngClass]="groupClass()" [innerHTML]="item.label"></div>
      </ng-template>
      <ng-template let-item #item>
        @if (item?.iconClass) {
          <i [ngClass]="item.iconClass"></i>&nbsp;
        }
        <span [innerHTML]="item.label" [title]="item.originalLabel ? item.originalLabel : ''"></span>
      </ng-template>
    </p-autoComplete>
  `,
  imports: [AutoComplete, FormsModule, AutoFocus, NgClass],
})
export class SearchAutocompleteComponent implements AfterViewInit {
  protected recordService: RecordService = inject(RecordService);

  // Input
  delay = input<number>(300);
  groupClass = input<string>('core:text-gray-400');
  inputStyleClass = input<string>('core:w-full');
  minLength = input<number>(3);
  placeholder = input<string>();
  recordTypes = input.required<AutoCompleteRecordType[]>();
  scrollHeight = input<string>(CONFIG.DEFAULT_SELECT_SCROLL_HEIGHT);
  styleClass = input<string>('core:w-full');
  value = input.required<string>();

  // Output
  searchQuery = output<string>();

  // Current value
  currentValue = '';

  // Whether to display options as grouped when nested options are provided.
  group = false;
  overlayOptions: OverlayOptions = {};

  readonly autoComplete = viewChild<AutoComplete>('autoComplete');

  // User Query
  private query = new Subject<string>();

  buttonClick() {
    this.searchQuery.emit(this.currentValue);
  }

  suggestions = toSignal<any[], any[]>(this.query.pipe(switchMap((query: string) => this.getSuggestions(query))), {
    initialValue: [],
  });

  setSuggestionQuery(event: AutoCompleteCompleteEvent): void {
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

  ngAfterViewInit() {
    this.calculateWidth();
  }

  sanitize(value: string): string {
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
