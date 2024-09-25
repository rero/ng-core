/*
 * RERO angular core
 * Copyright (C) 2024 RERO
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
import { Component, inject, NgModule, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { Subject, switchMap } from 'rxjs';
import { IQueryOptions, IRemoteAutoCompleteFilter, ISuggestionItem } from './remote-autocomplete.interface';
import { RemoteAutocompleteService } from './remote-autocomplete.service';

export interface IRemoteAutoCompleteProps extends FormlyFieldProps {
  delay: number;
  filters?: IRemoteAutoCompleteFilter;
  group: boolean;
  minLength: number;
  maxLength?: number;
  queryOptions: IQueryOptions;
  placeholder?: string;
  scrollHeight: string;
  summaryClass?: string
}

@Component({
  selector: 'ng-core-remote-autocomplete',
  template: `
  <div class="flex w-full">
    @if (!valueSelected()) {
      @if (props.filters?.options) {
        <div class="flex">
          <p-dropdown
            [options]="props.filters.options"
            [ngModel]="props.filters.selected"
            (onChange)="changeFilter($event)"
          ></p-dropdown>
        </div>
      }
      <div class="flex ml-1 w-full">
        <p-autoComplete
          class="w-full"
          styleClass="w-full"
          inputStyleClass="w-full"
          [scrollHeight]="props.scrollHeight"
          [autocomplete]="true"
          [minLength]="props.minLength"
          [maxlength]="props.maxLength"
          [(ngModel)]="value"
          [placeholder]="props.placeholder"
          [suggestions]="suggestions()"
          (completeMethod)="search($event)"
          (onSelect)="onSelect($event)"
        >
          <ng-template let-data pTemplate="item">
            <div>{{ data.label }}</div>
            @if (data.summary) {
              <div [innerHTML]="data.summary" [ngClass]="summaryClass"></div>
            }
          </ng-template>
        </p-autoComplete>
      </div>
    } @else {
      <div class="py-1">
        <span [innerHtml]="valueSelected()"></span>
        <p-button icon="fa fa-trash" severity="secondary" [text]="true" (click)="clear()" styleClass="ml-1" />
      </div>
    }
  </div>
  `,
})
export class RemoteAutocomplete extends FieldType<FormlyFieldConfig<IRemoteAutoCompleteProps>> implements OnInit {

  private remoteAutocompleteService = inject(RemoteAutocompleteService);
  private route = inject(ActivatedRoute);

  private query = new Subject<string>();

  private onValueSelect = new Subject<ISuggestionItem>();

  suggestions = toSignal(this.query.pipe(
    switchMap((query: string) => this.remoteAutocompleteService.getSuggestions(
      query,
      this.props.queryOptions,
      this.route.snapshot.params.pid || null
    ))
  ), { initialValue: []});

  valueSelected = toSignal(this.onValueSelect.pipe(
    switchMap((selected?: ISuggestionItem) => this.remoteAutocompleteService.getValueAsHTML(
      this.props.queryOptions,
      selected
    ))
  ));

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<IRemoteAutoCompleteProps>> = {
    props: {
      delay: 300,
      group: false,
      minLength: 1,
      scrollHeight: '250px',
      queryOptions: {
        allowAdd: false,
      }
    }
  };

  value: string = '';

  ngOnInit(): void {
    if (this.props.filters) {
      this.props.queryOptions.filter = this.props.filters.selected;
    }
  }
  changeFilter(filter: DropdownChangeEvent): void {
    this.props.queryOptions.filter = filter.value;
    this.value = '';
  }

  search(event: AutoCompleteCompleteEvent): void {
    this.query.next(event.query);
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    this.onValueSelect.next(event.value);
    this.formControl.patchValue(event.value.value);
  }

  clear(): void {
    this.value = '';
    this.formControl.reset(null);
    this.onValueSelect.next(null);
    this.field.focus = true;
  }
}

@NgModule({
  declarations: [RemoteAutocomplete],
  imports: [
    AutoCompleteModule,
    ButtonModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    FormlyModule.forChild({
      types: [
        { name: 'remoteAutoComplete', component: RemoteAutocomplete }
      ]
    }),
  ],
  exports: [RemoteAutocomplete]
})
export class NgCoreFormlyRemoteAutocompleteModule { }
