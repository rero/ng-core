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
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule as FormlyCoreSelectModule, FormlyFieldSelectProps } from '@ngx-formly/core/select';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { DropdownModule } from 'primeng/dropdown';
import { isObservable, of } from 'rxjs';

export interface ISelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: any;
  class?: string;
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
}

export interface IFormlySelectFieldConfig extends FormlyFieldConfig<ISelectProps> {
  type: 'select' | Type<SelectComponent>;
}

@Component({
  selector: 'ng-core-primeng-select',
  template: `
     <p-dropdown
      [appendTo]="props.appendTo"
      [class]="props.class"
      [dropdownIcon]="props.dropdownIcon"
      [editable]="props.editable"
      [emptyFilterMessage]="props.emptyFilterMessage"
      [emptyMessage]="props.emptyMessage"
      [filter]="props.filter"
      [filterMatchMode]="props.filterMatchMode"
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
export class SelectComponent extends FieldType<FormlyFieldConfig<ISelectProps>> implements OnInit {

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<ISelectProps>> = {
    props: {
      class: 'w-full',
      editable: false,
      filter: false,
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
      tooltipPositionStyle: 'absolute'
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
  declarations: [ SelectComponent ],
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    FormlyCoreSelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'select',
          component: SelectComponent,
          wrappers: ['form-field'],
        },
        { name: 'enum', extends: 'select' },
      ],
    }),
  ],
})
export class NgCoreFormlySelectModule { }
