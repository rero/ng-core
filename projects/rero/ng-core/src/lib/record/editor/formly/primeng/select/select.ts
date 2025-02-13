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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, NgModule, OnInit, Type } from '@angular/core';
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
  panelStyleClass?: string;
  placeholder?: string;
  required: boolean;
  scrollHeight: string;
  sort: boolean;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  @if(selectOptions) {
    <p-dropdown
      [appendTo]="props.appendTo"
      [class]="props.class"
      [dropdownIcon]="props.dropdownIcon"
      [editable]="props.editable"
      [emptyFilterMessage]="props.emptyFilterMessage"
      [emptyMessage]="props.emptyMessage"
      [filter]="props.filter"
      filterBy="label"
      [filterMatchMode]="props.filterMatchMode"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [group]="props.group"
      [loadingIcon]="props.loadingIcon"
      [options]="selectOptions"
      optionLabel="label"
      optionValue="value"
      [panelStyleClass]="props.panelStyleClass"
      [placeholder]="props.placeholder"
      [required]="props.required"
      [showClear]="!props.required"
      [styleClass]="props.styleClass"
      [tooltip]="props.tooltip"
      [tooltipPosition]="props.tooltipPosition"
      [tooltipPositionStyle]="props.tooltipPositionStyle"
      [tooltipStyleClass]="props.tooltipStyleClass"
      (onChange)="props.change && props.change(field, $event)"
    >
      <ng-template let-group pTemplate="group">
        @if (group.label !== 'group-preferred' && group.label !== 'group-other') {
          <div class="option-group">{{ group.label }}</div>
        } @else if (group.label === 'group-other') {
          <div class="option-group"><hr></div>
        }
      </ng-template>
    </p-dropdown>
  }
  `,
  styles: `
  :host ::ng-deep .p-dropdown-panel .p-dropdown-items .p-dropdown-item-group {
    padding: 0 0.3rem;
  }

  :host ::ng-deep .p-dropdown-panel .p-dropdown-items .p-dropdown-item-group hr {
    height: 1px;
    border: 0;
    border-top: 1px solid #ccc;
    padding: 0;
  }

  .option-group {
    padding: 0.5rem 0;
  }
  `
})
export class SelectComponent extends FieldType<FormlyFieldConfig<ISelectProps>> implements OnInit {

  protected cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<ISelectProps>> = {
    props: {
      class: 'w-full',
      editable: false,
      filter: false,
      filterMatchMode: 'contains',
      group: false,
      panelStyleClass: 'w-full',
      placeholder: 'Select…',
      required: false,
      scrollHeight: '250px',
      sort: false,
      styleClass: 'w-full mb-1',
      tooltipPosition: 'top',
      tooltipPositionStyle: 'absolute',
    }
  };

  selectOptions: any[];

  ngOnInit(): void {
    if (!isObservable(this.props.options)) {
      this.props.options = of(this.props.options);
    }

    this.props.options.subscribe((options: any) => {
      const preferredOptions = options.filter((option: any) => option.preferred);
      if (preferredOptions.length > 0) {
        this.props.group = true;
        const otherOptions = options.filter((option: any) => !option.preferred);
        this.selectOptions = [
          {
            label: 'group-preferred',
            items: this.props.sort ? this.sortOptions(preferredOptions) : preferredOptions
          },
          {
            label: 'group-other',
            items: this.props.sort ? this.sortOptions(otherOptions) : otherOptions
          }
        ];
      } else {
        this.selectOptions = this.props.sort ? this.sortOptions(options) : options;
      }
      this.cd.markForCheck();
    });
  }

  private sortOptions(options: any) {
    options = options.sort((a: any, b: any) => a.label.localeCompare(b.label));
    if (options.filter((option: any) => option.items).length > 0) {
      options.forEach((option: any) => {
        if (option.items) {
          return this.sortOptions(option.items);
        }
      });
    }

    return options;
  }
}

@NgModule({
  declarations: [SelectComponent],
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
  exports: [SelectComponent]
})
export class NgCoreFormlySelectModule { }
