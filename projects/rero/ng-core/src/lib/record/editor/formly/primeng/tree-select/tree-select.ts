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
import { FormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule } from '@ngx-formly/primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { TreeNodeSelectEvent } from 'primeng/tree';
import { TreeSelectModule } from 'primeng/treeselect';
import { map, merge, Observable, Subscription, switchMap, tap } from 'rxjs';
import { TranslateLabelService } from '../services/translate-label.service';

// Doc https://primeng.org/treeselect

export interface ITreeSelectProps extends FormlyFieldProps {
  class?: string;
  containerStyleClass?: string;
  disabled?: boolean;
  filterBy: string;
  filterInputAutoFocus: boolean;
  filterPlaceholder?: string;
  fluid: boolean;
  panelClass?: string;
  panelStyleClass?: string;
  placeholder?: string;
  scrollHeight: string;
  variant: string;
}

export interface FormlyTreeSelectFieldConfig extends FormlyFieldConfig<ITreeSelectProps> {
  type: 'tree-select' | Type<TreeSelectComponent>;
}

@Component({
    selector: 'ng-core-tree-select',
    template: `
    <p-treeSelect
      [class]="props.class"
      [containerStyleClass]="props.containerStyleClass"
      [disabled]="props.disabled"
      [filter]="filter"
      [filterBy]="props.filterBy"
      [filterInputAutoFocus]="props.filterInputAutoFocus"
      [filterPlaceholder]="props.filterPlaceholder"
      [fluid]="props.fluid"
      [formlyAttributes]="field"
      [ngModel]="nodeSelected"
      [options]="optionValues$|async"
      [panelClass]="props.panelClass"
      [panelStyleClass]="props.panelStyleClass"
      [placeholder]="props.placeholder | translate"
      [showClear]="!props.required"
      [variant]="props.variant"
      (onNodeSelect)="setFormValue($event)"
      (onNodeUnselect)="clearFormValue()"
      (onClear)="clearFormValue()"
    />
  `,
    standalone: false
})
export class TreeSelectComponent extends FieldType<FormlyFieldConfig<ITreeSelectProps>> implements OnInit, OnDestroy {

  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private subscription: Subscription = new Subscription();
  filter: boolean = false;

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<ITreeSelectProps>> = {
    props: {
      filterBy: 'label',
      filterInputAutoFocus: true,
      fluid: true,
      panelStyleClass: 'core:max-w-full',
      placeholder: 'Select…',
      scrollHeight: '400px',
      variant: 'outlined'
    }
  };

  nodeSelected: any = undefined;

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
      }),
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
      const child =  this.enableFilter(option?.children, total)
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

  setFormValue(event: TreeNodeSelectEvent): void {
    this.formControl.setValue(event.node.data);
  }

  clearFormValue(): void {
    this.formControl.reset(null);
    const { errors } = this.formControl;
    this.formControl.setErrors(errors.required? {required: true}: null);
  }

  private findNodeByValue(node: TreeNode[], value: string, data?: TreeNode): any {
    if (!data) {
      node.map((treeNode: TreeNode) => {
        if (treeNode.data === value) {
          data = treeNode;
        }
        else if (treeNode.children) {
          data = this.findNodeByValue(treeNode.children, value, data);
        }
      });
    }

    return data;
  }
}

@NgModule({
  declarations: [ TreeSelectComponent ],
  imports: [
    CommonModule,
    FormsModule,
    FormlySelectModule,
    TranslateModule.forChild(),
    TreeSelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'tree-select',
          component: TreeSelectComponent,
          wrappers: ['form-field'],
        }
      ],
    }),
  ],
})
export class NgCoreFormlyTreeSelectModule { }
