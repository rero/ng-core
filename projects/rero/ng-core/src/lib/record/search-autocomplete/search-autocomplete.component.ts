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
import { AfterViewInit, Component, HostListener, inject, input, output, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OverlayOptions } from 'primeng/api';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteDropdownClickEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DomHandler } from 'primeng/dom';
import { combineLatest, map, Observable, Subject, switchMap } from 'rxjs';
import { RecordService } from '../record.service';
import { SanitizePipe } from '../../pipe/sanitize.pipe';
import { CONFIG } from '../../utils/config';

export interface IRecordType {
  field: string;
  groupLabel?: string;
  index: string;
  maxSuggestions?: number;
  processSuggestions: Function;
  preFilters?: any;
  queryParams?: Object;
  sort?: string;
};

export interface IAutoComplete {
  iconClass?: string;
  index: string;
  label: string;
  originalLabel?: string;
  value?: string;
  [key: string]: string;
}

@Component({
    selector: 'ng-core-search-autocomplete',
    template: `
    <p-autoComplete
      #autoComplete
      [overlayOptions]="overlayOptions"
      dropdownIcon="fa fa-search"
      [dropdown]="true"
      dropdownMode="none"
      [styleClass]="styleClass()"
      [inputStyleClass]="inputStyleClass()"
      [delay]="delay()"
      [group]="group"
      [minLength]="minLength()"
      [placeholder]="placeholder()"
      [ngModel]="value()"
      (ngModelChange)="currentValue = sanitize($event)"
      [scrollHeight]="scrollHeight()"
      [suggestions]="suggestions()"
      (completeMethod)="setSuggestionQuery($event)"
      (onSelect)="onSelectValue($event)"
      (onKeyUp)="search($event)"
      (onDropdownClick)="buttonClick($event)"
      [pAutoFocus]="true"
    >
    <ng-template let-item #group>
      <div class="core:flex core:items-center" [ngClass]="groupClass()" [innerHTML]="item.label"></div>
    </ng-template>
    <ng-template let-item #item>
        @if(item.iconClass) {
          <i [ngClass]="item.iconClass"></i>&nbsp;
        }
        <span [innerHTML]="item.label" [title]="item.originalLabel ? item.originalLabel : ''"></span>
    </ng-template>
    </p-autoComplete>
  `,
    standalone: false
})
export class SearchAutocompleteComponent implements AfterViewInit{

  protected recordService: RecordService = inject(RecordService);
  protected sanitizePipe: SanitizePipe = inject(SanitizePipe);

  // Input
  delay = input<number>(300);
  groupClass = input<string>('core:text-gray-400');
  inputStyleClass = input<string>('core:w-full');
  minLength = input<number>(3);
  placeholder = input(null);
  recordTypes = input.required<IRecordType[]>();
  scrollHeight = input<string>(CONFIG.DEFAULT_SELECT_SCROLL_HEIGHT);
  styleClass = input<string>('core:w-full');
  value = input<string>();

  // Output
  onSearch = output<string>();

  // Current value
  currentValue: string = '';

  // Whether to display options as grouped when nested options are provided.
  group = false;
  overlayOptions: OverlayOptions = {};

  @ViewChild('autoComplete') autoComplete: AutoComplete;

  // User Query
  private query = new Subject<string>();

  buttonClick(event: AutoCompleteDropdownClickEvent) {
    this.onSearch.emit(this.currentValue);
  }

  suggestions = toSignal(this.query.pipe(
    switchMap((query: string) => this.getSuggestions(query))
  ), { initialValue: []});

  setSuggestionQuery(event: AutoCompleteCompleteEvent): void {
    this.query.next(event.query);
  }

  onSelectValue(event: AutoCompleteSelectEvent) {
    this.onSearch.emit(event.value);
  }

  search(event: KeyboardEvent) {
    if(event?.code === 'Enter') {
      this.onSearch.emit(this.currentValue);
    }
  }

  calculateWidth() {
    let width = 200;
    if (this.autoComplete) {
      width = DomHandler.getOuterWidth(this.autoComplete.el.nativeElement);
    }
    this.overlayOptions = {
      contentStyle: { width: width * 1 + 'px' }
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
    return this.sanitizePipe.transform(value);
  }

  private getSuggestions(query: string): any {
    return combineLatest(this.prepareQuery(query)).pipe(
      map((data: IAutoComplete[]) => {
        if (data.length > 1) {
          this.group = true;
          const suggestions = [];
          data.forEach((hits: any) => {
            if (hits.length > 0) {
              const selectedRecordType = this.recordTypes().find((type: IRecordType) => type.index === hits[0].index);
              if (!('groupLabel' in selectedRecordType)) {
                throw new Error('Missing groupLabel definition');
              }
              suggestions.push({
                label: selectedRecordType.groupLabel,
                items: hits
              });
            }
          });
          return suggestions;
        } else {
          return data[0];
        }
      })
    );
  }

  private prepareQuery(query: string): Observable<any>[] {
    const suggestions: Observable<any>[] = [];
    this.recordTypes().forEach((recordType: IRecordType) => {
      const queryParams = [];
      if ('queryParams' in recordType) {
        Object.keys(recordType.queryParams).forEach(key => {
          queryParams.push(`${key}:${recordType.queryParams[key].replace(':', '\\:')}`);
        });
      }
      let queryRecord = `${recordType.field}:${query}`;
      if (queryParams.length > 0) {
        queryRecord += ` AND ${queryParams.join(' AND ')}`;
      }
      suggestions.push(this.recordService.getRecords(
        recordType.index,
        queryRecord,
        1,
        recordType.maxSuggestions || 10,
        [],
        recordType.preFilters || {},
        null,
        recordType.sort || null,
      ).pipe(
        map((data: any) => recordType.processSuggestions(data, query))
      ));
    });

    return suggestions;
  }
}
