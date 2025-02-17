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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, NgModule, OnDestroy, OnInit, Type } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule as FormlyCoreSelectModule, FormlyFieldSelectProps } from '@ngx-formly/core/select';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { map, merge, Observable, Subscription, switchMap } from 'rxjs';
import { TranslateLabelService } from './translate-label.service';

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
      [filter]="props.filter"
      filterBy="label"
      [filterMatchMode]="props.filterMatchMode"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [group]="props.group"
      [loadingIcon]="props.loadingIcon"
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
        {{ selected.label | translate }}
      </ng-template>
      <ng-template let-group #group>
        @if (group.untranslatedLabel !== 'group-preferred' && group.untranslatedLabel !== 'group-other') {
          <div class="option-group">{{ group.label }}</div>
        } @else if (group.label === 'group-other') {
          <div class="option-group"><hr></div>
        }
      </ng-template>
    </p-select>
  }
  `,
    styles: `
  :host ::ng-deep .p-select-panel .p-select-items .p-select-item-group {
    padding: 0 0.3rem;
  }

  :host ::ng-deep .p-select-panel .p-select-items .p-select-item-group hr {
    height: 1px;
    border: 0;
    border-top: 1px solid #ccc;
    padding: 0;
  }

  .option-group {
    padding: 0.5rem 0;
  }
  `,
    standalone: false
})
export class SelectComponent extends FieldType<FormlyFieldConfig<ISelectProps>> implements OnInit, OnDestroy {

  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private subscription: Subscription = new Subscription();

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<ISelectProps>> = {
    props: {
      class: 'core:w-full',
      editable: false,
      filter: false,
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
    }
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
