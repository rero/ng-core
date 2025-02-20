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
import { TranslateLabelService } from '@rero/ng-core/src/lib/record/editor/formly/primeng/select';
import { TreeNode } from 'primeng/api';
import { TreeNodeSelectEvent } from 'primeng/tree';
import { TreeSelectModule } from 'primeng/treeselect';
import { map, merge, Observable, Subscription, switchMap } from 'rxjs';

// Doc https://primeng.org/treeselect

export interface ITreeSelectProps extends FormlyFieldProps {
  class: string;
  containerStyleClass: string;
  disabled?: boolean;
  filter: boolean;
  filterBy: string;
  filterPlaceholder?: string;
  panelClass: string;
  panelStyleClass: string;
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
      [filter]="props.filter"
      [filterBy]="props.filterBy"
      [filterPlaceholder]="props.filterPlaceholder"
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
})
export class TreeSelectComponent extends FieldType<FormlyFieldConfig<ITreeSelectProps>> implements OnInit, OnDestroy {

  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private subscription: Subscription = new Subscription();

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<ITreeSelectProps>> = {
    props: {
      class: 'w-full',
      containerStyleClass: 'w-full',
      filter: false,
      filterBy: 'label',
      panelClass: 'w-full',
      panelStyleClass: 'w-full',
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
      map(options => {
        this.ref.markForCheck();
        return this.translateLabelService.translateLabel(options);
      })
    );
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
    TranslateModule.forRoot(),
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
