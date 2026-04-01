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
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, Injector, OnInit, runInInjectionContext, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { Select, SelectChangeEvent } from 'primeng/select';
import { map, of, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import { CONFIG } from '../../../core/config/config';
import { removeChars } from '../../../core/utils/utils';
import { TranslateLabelService } from '../../service/translate-label.service';
import { IQuery, IQueryOptions, IRemoteAutoCompleteFilter, IValueSelect } from './remote-autocomplete.interface';
import { RemoteAutocompleteService } from './remote-autocomplete.service';

export interface IRemoteAutoCompleteProps extends FormlyFieldProps {
  delay: number;
  filters?: IRemoteAutoCompleteFilter;
  group: boolean;
  minLength: number;
  maxLength?: number;
  queryOptions?: IQueryOptions;
  placeholder?: string;
  scrollHeight: string;
  summaryClass?: string;
}

@Component({
  selector: 'ng-core-remote-autocomplete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      style="padding-inline: 0; padding-block: 0"
      class="core:flex core:gap-1"
      [ngClass]="{ 'p-inputtext ng-invalid ng-dirty': showError }"
    >
      @if (!field.formControl.value) {
        @if (props.filters?.options) {
          <p-select
            [options]="optionValues()"
            [ngModel]="props.filters?.selected"
            (onChange)="changeFilter($event)"
          >
            <ng-template let-selected #selectedItem>
              {{ selected.untranslatedLabel | translate }}
            </ng-template>
          </p-select>
        }
        <p-autoComplete
          class="core:grow"
          inputStyleClass="core:w-full"
          [scrollHeight]="props.scrollHeight"
          [minQueryLength]="props.minLength"
          [maxlength]="props.maxLength || null"
          [(ngModel)]="value"
          [placeholder]="props.placeholder"
          [group]="props.group"
          [suggestions]="suggestions()"
          (completeMethod)="search($event)"
          (onSelect)="onSelect($event)"
        >
          <ng-template #item let-data>
            <div class="core:w-full">
              <div class="core:flex core:gap-2">
                <span class="core:grow" [innerHTML]="data.label"></span>
                @if (data.link) {
                  <a class="core:flex-none core:text-color-secondary" [href]="data.link" target="_blank">
                    <i class="fa fa-external-link"></i>
                  </a>
                }
              </div>
              @if (data.summary) {
                <div class="core:w-full" [innerHTML]="data.summary" [ngClass]="props.summaryClass"></div>
              }
            </div>
          </ng-template>
        </p-autoComplete>
      } @else {
        <div class="core:flex core:gap-1 core:items-center">
          <div [innerHtml]="valueSelected()"></div>
          <p-button icon="fa fa-trash" severity="secondary" [text]="true" (onClick)="clear()" />
        </div>
      }
    </div>
  `,
  imports: [NgClass, Select, FormsModule, AutoComplete, Button, TranslatePipe],
})
export class RemoteAutocompleteComponent
  extends FieldType<FieldTypeConfig<IRemoteAutoCompleteProps>>
  implements OnInit, AfterViewInit
{
  protected translateService: TranslateService = inject(TranslateService);
  protected remoteAutocompleteService = inject(RemoteAutocompleteService);
  protected route = inject(ActivatedRoute);
  protected translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private injector = inject(Injector);

  protected query = new Subject<IQuery>();

  protected onValueSelect = new Subject<IValueSelect>();

  suggestions = toSignal(
    this.query.pipe(
      switchMap((data: IQuery) => {
        if (!data.recordPid) {
          return of([]);
        }
        return this.remoteAutocompleteService.getSuggestions(
          removeChars(data.query),
          data.queryOptions,
          data.recordPid,
        );
      }),
    ),
    { initialValue: [] },
  );

  valueSelected = toSignal(
    this.onValueSelect.pipe(
      switchMap((data: IValueSelect) => this.remoteAutocompleteService.getValueAsHTML(data.queryOptions, data.item)),
    ),
  );

  /** Default properties */
  defaultOptions: Partial<FieldTypeConfig<IRemoteAutoCompleteProps>> = {
    props: {
      delay: 300,
      group: false,
      minLength: 3,
      scrollHeight: CONFIG.DEFAULT_SELECT_SCROLL_HEIGHT,
      queryOptions: {
        allowAdd: false,
        maxOfResult: 100,
      },
    },
  };

  value = '';

  optionValues!: Signal<any[]>;

  ngOnInit(): void {
    const options$ = (this.props.filters?.options ?? of([])).pipe(shareReplay(1));
    this.optionValues = runInInjectionContext(this.injector, () =>
      toSignal(
        this.translateService.onLangChange.pipe(
          startWith(null),
          switchMap(() => options$),
          map((options: any) => this.translateLabelService.translateLabel(options)),
        ),
        { initialValue: [] },
      ),
    );
  }

  ngAfterViewInit(): void {
    if (this.field.props.filters && this.field.props.queryOptions) {
      this.field.props.queryOptions.filter = this.field.props.filters.selected;
    }
    if (this.formControl?.value?.length > 0) {
      this.onValueSelect.next({
        item: { label: this.formControl.value, value: this.formControl.value },
        queryOptions: { ...this.field.props.queryOptions },
      });
    }
  }

  changeFilter(filter: SelectChangeEvent): void {
    if (this.field.props.queryOptions) {
      this.field.props.queryOptions.filter = filter.value;
      this.value = '';
    }
  }

  search(event: AutoCompleteCompleteEvent): void {
    this.query.next({
      query: event.query,
      queryOptions: { ...this.field.props.queryOptions },
      recordPid: this.route.snapshot.params.pid || null,
    });
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    this.onValueSelect.next({
      item: event.value,
      queryOptions: { ...this.field.props.queryOptions },
    });
    this.formControl.patchValue(event.value.value);
    this.formControl.markAsTouched();
  }

  clear(): void {
    this.value = '';
    this.formControl.reset(null);
    this.field.focus = true;
  }
}
