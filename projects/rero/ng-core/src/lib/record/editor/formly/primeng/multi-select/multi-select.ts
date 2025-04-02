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
import { TranslateLabelService } from '@rero/ng-core/src/lib/record/editor/formly/primeng/select';
import { MultiSelectModule as PrimeNgMultiSelectModule } from 'primeng/multiselect';
import { map, merge, Observable, Subscription, switchMap } from 'rxjs';

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
      [filter]="props.filter"
      filterBy="label"
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
        @for(option of items; track items; let last = $last) {
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
    </p-multiSelect>
  `,
    standalone: false
})
export class MultiSelectComponent extends FieldType<FormlyFieldConfig<IMultiSelectProps>> implements OnInit, OnDestroy {

  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private subscription: Subscription = new Subscription();

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<IMultiSelectProps>> = {
    props: {
      class: 'core:w-full',
      display: 'comma',
      editable: false,
      filter: true,
      filterMatchMode: 'contains',
      group: false,
      panelStyleClass: 'core:w-full',
      placeholder: 'Select…',
      required: false,
      scrollHeight: '250px',
      sort: false,
      styleClass: 'core:w-full core:mb-1',
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
      map(options => {
        this.ref.markForCheck();
        return this.translateLabelService.translateLabel(options);
      })
    );
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
