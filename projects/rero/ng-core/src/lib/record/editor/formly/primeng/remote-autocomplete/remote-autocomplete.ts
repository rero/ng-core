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
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, inject, NgModule, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { map, merge, Observable, Subject, switchMap } from 'rxjs';
import { IQuery, IQueryOptions, IRemoteAutoCompleteFilter, IValueSelect } from './remote-autocomplete.interface';
import { RemoteAutocompleteService } from './remote-autocomplete.service';
import { CONFIG } from '../../../../../utils/config';

export interface IRemoteAutoCompleteProps extends FormlyFieldProps {
  delay: number;
  filters?: IRemoteAutoCompleteFilter;
  group: boolean;
  minLength: number;
  maxLength?: number;
  queryOptions?: IQueryOptions;
  placeholder?: string;
  scrollHeight: string;
  summaryClass?: string
}

@Component({
  selector: 'ng-core-remote-autocomplete',
  standalone: false,
  template: `
  <div style="padding-inline: 0; padding-block: 0" class="core:flex core:gap-1" [ngClass]="{ 'p-inputtext ng-invalid ng-dirty': showError }">
    @if (!field.formControl.value) {
      @if (props.filters?.options) {
        <p-select
          [options]="optionValues$|async"
          [ngModel]="props.filters.selected"
          (onChange)="changeFilter($event)"
        >
          <ng-template let-selected #selectedItem>
            {{ selected.untranslatedLabel | translate }}
          </ng-template>
        </p-select>
      }
        <p-autoComplete
          class="core:grow"
          styleClass="core:w-full"
          inputStyleClass="core:w-full"
          [scrollHeight]="props.scrollHeight"
          [minLength]="props.minLength"
          [maxlength]="props.maxLength"
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
})
export class RemoteAutocomplete extends FieldType<FormlyFieldConfig<IRemoteAutoCompleteProps>> implements OnInit,AfterViewInit {

  protected translateService: TranslateService = inject(TranslateService);
  protected remoteAutocompleteService = inject(RemoteAutocompleteService);
  protected route = inject(ActivatedRoute);
  protected ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  protected query = new Subject<any>();

  protected onValueSelect = new Subject<IValueSelect>();

  suggestions = toSignal(this.query.pipe(
    switchMap((data: IQuery) => this.remoteAutocompleteService.getSuggestions(
      data.query,
      data.queryOptions,
      data.recordPid
    ))
  ), { initialValue: []});

  valueSelected = toSignal(this.onValueSelect.pipe(
    switchMap((data: IValueSelect) => this.remoteAutocompleteService.getValueAsHTML(
      data.queryOptions,
      data.item
    ))
  ));

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<IRemoteAutoCompleteProps>> = {
    props: {
      delay: 300,
      group: false,
      minLength: 3,
      scrollHeight: CONFIG.DEFAULT_SELECT_SCROLL_HEIGHT,
      queryOptions: {
        allowAdd: false,
        maxOfResult: 100
      }
    }
  };

  value: string = '';

  optionValues$: Observable<any[]>;

  ngOnInit(): void {
    if (this.props.filters) {
      const optionsObs = this.props.filters.options;
      const changeObs = this.translateService.onLangChange.pipe(switchMap(() => this.optionValues$));
      this.optionValues$ = merge(...[optionsObs, changeObs])
      .pipe(
        map(options => {
          this.ref.markForCheck();
          return this.translateLabel(options);
        })
      );
    }
  }

  ngAfterViewInit(): void {
    if (this.field.props.filters) {
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
    this.field.props.queryOptions.filter = filter.value;
    this.value = '';
  }

  search(event: AutoCompleteCompleteEvent): void {
    this.query.next({
      query: event.query,
      queryOptions: { ...this.field.props.queryOptions },
      recordPid: this.route.snapshot.params.pid || null
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

  translateLabel(options: any): any[] {
    options.map((option: any) => {
      if (!option.untranslatedLabel) {
        option.untranslatedLabel = option.label;
      }
      option.label = this.translateService.instant(option.untranslatedLabel);
    });

    return options;
  }
}

@NgModule({
  declarations: [RemoteAutocomplete],
  imports: [
    AutoCompleteModule,
    ButtonModule,
    CommonModule,
    SelectModule,
    FormsModule,
    TranslateModule.forChild(),
    FormlyModule.forChild({
      types: [
        { name: 'remoteAutoComplete', component: RemoteAutocomplete }
      ]
    }),
  ],
  exports: [RemoteAutocomplete]
})
export class NgCoreFormlyRemoteAutocompleteModule { }
