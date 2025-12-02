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
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { FormlySelectOption } from '@ngx-formly/core/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { TreeNodeSelectEvent } from 'primeng/tree';
import { TreeSelect } from 'primeng/treeselect';
import { combineLatest, map, Observable, of, startWith, Subscription, tap } from 'rxjs';
import { CONFIG } from '../../../core/config/config';
import { TranslateLabelService } from '../../service/translate-label.service';

export interface NgCoreTreeSelectOption extends FormlySelectOption {
  children?: NgCoreTreeSelectOption[];
}

// Doc https://primeng.org/treeselect

export interface ITreeSelectProps extends FormlyFieldProps {
  class: string;
  containerStyleClass: string;
  disabled: boolean;
  filterBy: string;
  filterInputAutoFocus: boolean;
  filterPlaceholder?: string;
  fluid: boolean;
  panelClass: string;
  panelStyleClass: string;
  placeholder: string;
  scrollHeight: string;
  variant: "filled" | "outlined";
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
      [options]="optionValues"
      [panelClass]="props.panelClass"
      [panelStyleClass]="props.panelStyleClass"
      [placeholder]="props.placeholder | translate"
      [showClear]="!props.required"
      [variant]="props.variant"
      [ngClass]="{ 'ng-invalid ng-dirty': showError }"
      (onNodeSelect)="setFormValue($event)"
      (onNodeUnselect)="clearFormValue()"
      (onClear)="clearFormValue()"
    >
      <ng-template let-item #item>
        <span class="core:whitespace-normal">
          {{item.label}}
        </span>
      </ng-template>
    </p-treeSelect>
  `,
    imports: [TreeSelect, FormlyModule, FormsModule, NgClass, TranslatePipe],
    providers: [TranslateLabelService]
})
export class TreeSelectComponent extends FieldType<FieldTypeConfig<ITreeSelectProps>> implements OnInit, OnDestroy {

  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private subscription: Subscription = new Subscription();
  filter = false;

  /** Default properties */
  defaultOptions: Partial<FieldTypeConfig<ITreeSelectProps>> = {
    props: {
      filterBy: 'label',
      filterInputAutoFocus: true,
      disabled: false,
      fluid: true,
      class: '',
      containerStyleClass: '',
      panelClass: '',
      panelStyleClass: '',
      placeholder: 'Select…',
      scrollHeight: CONFIG.DEFAULT_SELECT_SCROLL_HEIGHT,
      variant: 'outlined'
    }
  };

  nodeSelected: TreeNode | null = null;

  optionValues$!: Observable<NgCoreTreeSelectOption[]>;

  optionValues: TreeNode[] = [];

  ngOnInit(): void {
    const optionsObs = this.props.options ?? of([]);
    const langChangeObs = this.translateService.onLangChange.pipe(startWith(null));
    this.optionValues$ = combineLatest([optionsObs, langChangeObs])
    .pipe(
      tap(([options]) => {
        this.filter = this.enableFilter(options, 0).enabled;
      }),
      map(([options]) => {
        this.ref.markForCheck();
        return this.translateLabelService.translateLabel(options);
      }),
    );
    this.subscription.add(this.optionValues$.subscribe((options: TreeNode[]) => {
      this.optionValues = options;
      if (this.formControl?.value) {
        this.nodeSelected = this.findNodeByValue(options, this.formControl?.value);
      } else {
        this.nodeSelected = null;
      }
    }));
    this.subscription.add(this.formControl?.valueChanges.subscribe((value) => {
      if (value) {
        this.nodeSelected = this.findNodeByValue(this.optionValues, value);
      } else {
        this.nodeSelected = null;
      }
    }));
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
  enableFilter(options?: NgCoreTreeSelectOption[], numberOfOptions=0): {enabled: boolean, total:number} {
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
      const child =  this.enableFilter(option.children, total)
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
    this.formControl.setErrors(errors?.required? {required: true}: null);
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
