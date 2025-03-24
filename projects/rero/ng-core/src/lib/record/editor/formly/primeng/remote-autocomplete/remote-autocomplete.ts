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
import { AfterViewInit, Component, inject, NgModule } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { Subject, switchMap } from 'rxjs';
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
  summaryClass?: string
}

@Component({
  selector: 'ng-core-remote-autocomplete',
  standalone: false,
  template: `
  <div class="core:flex core:gap-1">
    @if (!field.formControl.value) {
      @if (props.filters?.options) {
          <p-dropdown
            [options]="props.filters.options"
            [ngModel]="props.filters.selected"
            (onChange)="changeFilter($event)"
          />
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
export class RemoteAutocomplete extends FieldType<FormlyFieldConfig<IRemoteAutoCompleteProps>> implements AfterViewInit {

  protected remoteAutocompleteService = inject(RemoteAutocompleteService);
  protected route = inject(ActivatedRoute);

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
      scrollHeight: '400px',
      queryOptions: {
        allowAdd: false,
        maxOfResult: 100
      }
    }
  };

  value: string = '';

  ngAfterViewInit(): void {
    if (this.field.props.filters) {
      this.field.props.queryOptions.filter = this.field.props.filters.selected;
    }
    if (this.field.formControl?.value?.length > 0) {
      this.onValueSelect.next({
        item: { label: this.field.formControl.value, value: this.field.formControl.value },
        queryOptions: { ...this.field.props.queryOptions },
      });
    }
  }

  changeFilter(filter: DropdownChangeEvent): void {
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
  }

  clear(): void {
    this.value = '';
    this.formControl.reset(null);
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
