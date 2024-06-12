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
import { Component, NgModule, OnInit, Type } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { FormlyFieldSelectProps } from '@ngx-formly/core/select';
import { MultiSelectModule as PrimeNgMultiSelectModule } from 'primeng/multiselect';
import { isObservable, of } from 'rxjs';

export interface IMultiSelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: any;
  class?: string;
  display: string;
  dropdownIcon?: string;
  editable: boolean;
  emptyFilterMessage?: string;
  emptyMessage?: string;
  filter: boolean;
  filterMatchMode: 'endsWith' | 'startsWith' | 'contains' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte';
  group: boolean;
  loadingIcon?: string;
  optionDisabled?: string;
  optionGroupChildren: string;
  optionGroupLabel: string;
  optionLabel?: string;
  optionValue?: string;
  panelStyleClass?: string;
  required: boolean;
  scrollHeight: string;
  showClear?: boolean;
  styleClass?: string;
  tooltip?: string;
  tooltipPosition: 'left' | 'top' | 'bottom' | 'right';
  tooltipPositionStyle: string;
  tooltipStyleClass?: string;
  variant: 'outlined' | 'filled';
}

export interface FormlyMultiSelectFieldConfig extends FormlyFieldConfig<IMultiSelectProps> {
  type: 'multi-select' | Type<MultiSelectComponent>;
}

@Component({
  selector: 'ng-core-multi-select',
  template: `
    <p-multiSelect
      [appendTo]="props.appendTo"
      [class]="props.class"
      [display]="props.display"
      [dropdownIcon]="props.dropdownIcon"
      [emptyFilterMessage]="props.emptyFilterMessage"
      [emptyMessage]="props.emptyMessage"
      [filter]="props.filter"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [group]="props.group"
      [loadingIcon]="props.loadingIcon"
      [options]="selectOptions"
      [optionDisabled]="props.optionDisabled"
      [optionGroupChildren]="props.optionGroupChildren"
      [optionGroupLabel]="props.optionGroupLabel"
      [optionLabel]="props.optionLabel"
      [optionValue]="props.optionValue"
      [panelStyleClass]="props.panelStyleClass"
      [placeholder]="props.placeholder"
      [required]="props.required"
      [showClear]="props.showClear"
      [styleClass]="props.styleClass"
      [tooltip]="props.tooltip"
      [tooltipPosition]="props.tooltipPosition"
      [tooltipPositionStyle]="props.tooltipPositionStyle"
      [tooltipStyleClass]="props.tooltipStyleClass"
      (onChange)="props.change && props.change(field, $event)"
    />
  `,
})
export class MultiSelectComponent extends FieldType<FormlyFieldConfig<IMultiSelectProps>> implements OnInit {

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<IMultiSelectProps>> = {
    props: {
      class: 'w-full',
      display: 'comma',
      editable: false,
      filter: true,
      filterMatchMode: 'contains',
      group: false,
      optionGroupChildren: 'items',
      optionGroupLabel: 'label',
      panelStyleClass: 'w-full',
      required: false,
      scrollHeight: '250px',
      showClear: false,
      styleClass: 'w-full mb-1',
      tooltipPosition: 'top',
      tooltipPositionStyle: 'absolute',
      variant: 'outlined'
    }
  };

  selectOptions: any[] = [];

  ngOnInit(): void {
    if (!isObservable(this.props.options)) {
      this.props.options = of(this.props.options);
    }
    this.props.options.subscribe((options: any) => this.selectOptions = options);
  }
}


@NgModule({
  declarations: [ MultiSelectComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PrimeNgMultiSelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'multi-select',
          component: MultiSelectComponent,
          wrappers: ['form-field'],
        },
      ],
    }),
  ],
})
export class NgCoreFormlyMultiSelectModule { }
