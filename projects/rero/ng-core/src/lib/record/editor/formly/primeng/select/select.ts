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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, NgModule, OnDestroy, OnInit, Type } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule as FormlyCoreSelectModule, FormlyFieldSelectProps } from '@ngx-formly/core/select';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { map, merge, Observable, Subscription, switchMap, tap } from 'rxjs';
import { TranslateLabelService } from '../services/translate-label.service';
import { CONFIG } from '../../../../../utils/config';

export interface ISelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: any;
  class?: string;
  dropdownIcon?: string;
  editable: boolean;
  emptyFilterMessage?: string;
  emptyMessage?: string;
  filters?: any[];
  filterMatchMode: 'endsWith' | 'startsWith' | 'contains' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte';
  fluid: boolean,
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
  options?: Observable<any[]>;
}

export interface IFormlySelectFieldConfig extends FormlyFieldConfig<ISelectProps> {
  type: 'select' | Type<SelectComponent>;
}

@Component({
    selector: 'ng-core-primeng-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
  @if(props.options) {
    <p-select
      [appendTo]="props.appendTo"
      [class]="props.class"
      [dropdownIcon]="props.dropdownIcon"
      [editable]="props.editable"
      [emptyFilterMessage]="props.emptyFilterMessage"
      [emptyMessage]="props.emptyMessage"
      [filter]="filter"
      filterBy="label"
      [filterMatchMode]="props.filterMatchMode"
      [fluid]="props.fluid"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [group]="props.group"
      [loadingIcon]="props.loadingIcon"
      [scrollHeight]="props.scrollHeight"
      [ngClass]="{ 'ng-invalid ng-dirty': showError }"
      [options]="optionValues$|async"
      [optionLabel]="props.group ? undefined : 'label'"
      [optionValue]="props.group ? undefined : 'value'"
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
      <ng-template let-selected #selectedItem>
        {{ selected.untranslatedLabel | translate }}
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
    </p-select>
  }
  `,
    standalone: false
})
export class SelectComponent extends FieldType<FormlyFieldConfig<ISelectProps>> implements OnInit, OnDestroy {

  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private subscription: Subscription = new Subscription();
  filter: boolean = false;

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<ISelectProps>> = {
    props: {
      disabled: false,
      editable: false,
      filterMatchMode: 'contains',
      fluid: true,
      group: false,
      placeholder: 'Select…',
      required: false,
      scrollHeight: CONFIG.DEFAULT_SELECT_SCROLL_HEIGHT,
      sort: false,
      tooltipPosition: 'top',
      tooltipPositionStyle: 'absolute',
    }
  };

  optionValues$: Observable<any[]>;

  ngOnInit(): void {
    const optionsObs = this.props.options;
    const changeObs = this.translateService.onLangChange.pipe(switchMap(() => this.optionValues$));
    if (this.field.props?.disabled) {
      this.formControl.disable();
    }
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  clearValidators() {
    const { errors } = this.formControl;
    this.formControl.setErrors(errors.required? {required: true}: null);
  }
}

@NgModule({
  declarations: [SelectComponent],
  imports: [
    CommonModule,
    SelectModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
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
