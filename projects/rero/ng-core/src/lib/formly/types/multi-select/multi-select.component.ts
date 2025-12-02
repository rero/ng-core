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
import { Component, computed, inject, Injector, OnInit, Signal, signal, Type } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { FormlyFieldSelectProps, FormlySelectOption } from '@ngx-formly/core/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MultiSelect } from 'primeng/multiselect';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { CONFIG } from '../../../core/config/config';
import { TranslateLabelService } from '../../service/translate-label.service';

export interface NgCoreMultiSelectOption extends FormlySelectOption {
  items?: NgCoreMultiSelectOption[];
}

export interface IMultiSelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: any;
  class: string;
  display: string;
  dropdownIcon?: string;
  editable: boolean;
  emptyFilterMessage: string;
  emptyMessage: string;
  filterMatchMode: 'endsWith' | 'startsWith' | 'contains' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte';
  fluid: boolean;
  group: boolean;
  loadingIcon?: string;
  panelStyleClass?: string;
  placeholder?: string;
  required: boolean;
  scrollHeight: string;
  sort: boolean;
  styleClass?: string;
  tooltip: string;
  tooltipPosition: 'left' | 'top' | 'bottom' | 'right';
  tooltipPositionStyle: string;
  tooltipStyleClass?: string;
  variant: 'outlined' | 'filled';
  options?: Observable<NgCoreMultiSelectOption[]>;
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
      [filter]="filterEnabled()"
      filterBy="label"
      [fluid]="props.fluid"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [group]="props.group"
      [loadingIcon]="props.loadingIcon"
      [ngClass]="{ 'ng-invalid ng-dirty': showError }"
      [options]="optionValues()"
      optionLabel="label"
      optionValue="value"
      [panelStyleClass]="props.panelStyleClass"
      [placeholder]="props.placeholder | translate"
      [required]="props.required"
      [showClear]="!props.required"
      [styleClass]="props.styleClass"
      [tooltip]="props.tooltip"
      [tooltipPosition]="props.tooltipPosition"
      [tooltipPositionStyle]="props.tooltipPositionStyle"
      [tooltipStyleClass]="props.tooltipStyleClass"
      (onChange)="props.change && props.change(field, $event)"
      (onClear)="clearValidators()"
    >
      <ng-template #selectedItems let-items>
        @for(option of items; track option.value; let last = $last) {
          <div class="core:inline-flex core:items-center core:gap-2 core:px-1">
            <div>
              {{ option.label }}@if(!last) {, }
            </div>
          </div>
        }
        @if (!items || items.length === 0) {
          <div>{{ props.placeholder | translate }}</div>
        }
      </ng-template>
      <ng-template let-item #item>
        <span class="core:whitespace-normal">
          {{item.label}}
        </span>
      </ng-template>
      <ng-template let-group #group>
        @if (group.untranslatedLabel !== 'group-preferred' && group.untranslatedLabel !== 'group-other') {
          <div class="core:py-2 core:font-bold">{{ group.label }}</div>
        } @else if (group.label === 'group-other') {
          <div class="core:py-2"><hr></div>
        }
      </ng-template>
    </p-multiSelect>
  `,
  imports: [MultiSelect, FormsModule, ReactiveFormsModule, FormlyModule, NgClass, TranslatePipe],
  providers: [TranslateLabelService]

})
export class MultiSelectComponent extends FieldType<FieldTypeConfig<IMultiSelectProps>> implements OnInit {

  private injector: Injector = inject(Injector);
  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);

  optionValues: Signal<NgCoreMultiSelectOption[]> = signal([]);
  filterEnabled = computed(() => this.enableFilter(this.optionValues(), 0).enabled);

  /** Default properties */
  defaultOptions: Partial<FieldTypeConfig<IMultiSelectProps>> = {
    props: {
      display: 'comma',
      editable: false,
      filterMatchMode: 'contains',
      fluid: true,
      class: '',
      group: false,
      placeholder: 'Select…',
      emptyFilterMessage: '',
      emptyMessage: '',
      required: false,
      tooltip: '',
      scrollHeight: CONFIG.DEFAULT_SELECT_SCROLL_HEIGHT,
      sort: false,
      tooltipPosition: 'top',
      tooltipPositionStyle: 'absolute',
      variant: 'outlined',
    },
  };

  ngOnInit(): void {
    if (this.props.disabled) {
      this.formControl.disable();
    }

    const optionsObs = this.props.options ?? of([]);
    const langChangeObs = this.translateService.onLangChange.pipe(startWith(null));
    this.optionValues = toSignal(
      combineLatest([optionsObs, langChangeObs]).pipe(
        map(([options]) => this.translateLabelService.translateLabel(options))
      ),
      { initialValue: [], injector: this.injector }
    );
  }

  /**
   * Check if the filter feature of the select should be enabled.
   *
   * This function is interrupted if the threshold is reached.
   *
   * @param options the list of options
   * @param numberOfOptions the numberOfOptions used by the recursion
   * @returns enabled: true if the filter should be enabled, the current total of detected options (used by the recursion)
   */
  private enableFilter(options?: NgCoreMultiSelectOption[], numberOfOptions = 0): { enabled: boolean, total: number } {
    if (!options?.length) {
      return { total: numberOfOptions, enabled: false };
    }
    // number of entries to enable the filter
    const limit = 5;
    let total = numberOfOptions + options.length;
    if (total > limit) {
      return { enabled: true, total };
    }
    for (const option of options) {
      const child = this.enableFilter(option.items, total)
      total = child.total;
      if (total > limit) {
        return { enabled: total > limit, total };
      }
    }
    return { enabled: total > limit, total };
  }

  // Clear all validators except required.
  clearValidators() {
    const { errors } = this.formControl;
    this.formControl.setErrors(errors?.required ? { required: true } : null);
  }

}
