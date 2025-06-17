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
import { ChangeDetectorRef, Component, inject, NgModule, OnDestroy, OnInit, Type } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { FormlyFieldSelectProps, FormlySelectModule } from '@ngx-formly/core/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MultiSelectModule as PrimeNgMultiSelectModule } from 'primeng/multiselect';
import { map, merge, Observable, Subscription, switchMap, tap } from 'rxjs';
import { TranslateLabelService } from '../services/translate-label.service';

export interface IMultiSelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: any;
  class?: string;
  display: string;
  dropdownIcon?: string;
  editable: boolean;
  emptyFilterMessage?: string;
  emptyMessage?: string;
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
  tooltip?: string;
  tooltipPosition: 'left' | 'top' | 'bottom' | 'right';
  tooltipPositionStyle: string;
  tooltipStyleClass?: string;
  variant: 'outlined' | 'filled';
  options?: Observable<any[]>;
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
      [filter]="filter"
      filterBy="label"
      [fluid]="props.fluid"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [group]="props.group"
      [loadingIcon]="props.loadingIcon"
      [ngClass]="{ 'ng-invalid ng-dirty': showError }"
      [options]="optionValues$|async"
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
            <ng-template let-group #group>
        @if (group.untranslatedLabel !== 'group-preferred' && group.untranslatedLabel !== 'group-other') {
          <div class="core:py-2 core:font-bold">{{ group.label }}</div>
        } @else if (group.label === 'group-other') {
          <div class="core:py-2"><hr></div>
        }
      </ng-template>
    </p-multiSelect>
  `,
    standalone: false
})
export class MultiSelectComponent extends FieldType<FormlyFieldConfig<IMultiSelectProps>> implements OnInit, OnDestroy {

  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private subscription: Subscription = new Subscription();
  filter: boolean = false;

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<IMultiSelectProps>> = {
    props: {
      display: 'comma',
      editable: false,
      filterMatchMode: 'contains',
      fluid: true,
      group: false,
      panelStyleClass: 'core:max-w-full',
      placeholder: 'Select…',
      required: false,
      scrollHeight: '40vh',
      sort: false,
      tooltipPosition: 'top',
      tooltipPositionStyle: 'absolute',
      variant: 'outlined',
    },
  };

  optionValues$: Observable<any[]>;

  ngOnInit(): void {
    const optionsObs = this.props.options;
    const changeObs = this.translateService.onLangChange.pipe(switchMap(() => this.optionValues$));
    this.optionValues$ = merge(...[optionsObs, changeObs])
    .pipe(
      tap((options) => {
        this.filter = this.enableFilter(options, 0).enabled;
      }),
      map(options => {
        this.ref.markForCheck();
        return this.translateLabelService.translateLabel(options);
      })
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
  enableFilter(options, numberOfOptions=0): {enabled: boolean, total:number} {
    if(!options?.length) {
      return {total: numberOfOptions, enabled: false};
    }
    // number of entries to enable the filter
    const limit = 5;
    let total = numberOfOptions + options.length;
    if(total > limit) {
      return {enabled: true, total};
    }
    for(const option of options) {
      const child =  this.enableFilter(option?.items, total)
      total = child.total;
      if(total > limit) {
        return {enabled: total > limit, total};
      }
    }
    return {enabled: total > limit, total};
  }

  // Clear all validators except required.
  clearValidators() {
    const {errors} = this.formControl;
    this.formControl.setErrors(errors.required ? { required: true } : null);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

@NgModule({
  declarations: [MultiSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    FormlySelectModule,
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
  exports: [MultiSelectComponent],
})
export class NgCoreFormlyMultiSelectModule {}
