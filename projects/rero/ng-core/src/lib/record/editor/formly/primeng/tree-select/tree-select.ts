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
import { Component, NgModule, OnInit, Type, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { TreeNodeSelectEvent } from 'primeng/tree';
import { TreeSelectModule as PrimeNgTreeSelectModule } from 'primeng/treeselect';
import { isObservable, of } from 'rxjs';

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
  scrollHeight: string;
  showClear: boolean;
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
      [options]="selectOptions"
      [panelClass]="props.panelClass"
      [panelStyleClass]="props.panelStyleClass"
      [placeholder]="props.placeholder | translate"
      [showClear]="props.showClear"
      [variant]="props.variant"
      (onNodeSelect)="onNodeSelect($event)"
      (onNodeUnselect)="onNodeUnselect()"
    />
  `,
})
export class TreeSelectComponent extends FieldType<FormlyFieldConfig<ITreeSelectProps>> implements OnInit {

  /** Default properties */
  defaultOptions: Partial<FormlyFieldConfig<ITreeSelectProps>> = {
    props: {
      class: 'w-full',
      containerStyleClass: 'w-full',
      filter: false,
      filterBy: 'label',
      panelClass: 'w-full',
      panelStyleClass: 'w-full',
      scrollHeight: '400px',
      showClear: false,
      variant: 'outlined',
      placeholder: 'Select an option…'
    }
  };

  nodeSelected: any = undefined;
  // translateService = inject(TranslateService);
  // Doc for TreeNode https://primeng.org/treeselect#api.treeselect.interfaces.TreeNode
  selectOptions: TreeNode<any>[] = [];

  ngOnInit(): void {
    if (!isObservable(this.props.options)) {
      this.props.options = of(this.props.options);
    }
    this.props.options.subscribe((options: any) => {
      this.selectOptions = options;
      if (this.field.formControl.value) {
        this.nodeSelected = this.findNodeByValue(
          this.selectOptions,
          this.field.formControl.value
        );
      }
    });
  }

  onNodeSelect(event: TreeNodeSelectEvent): void {
    this.formControl.setValue(event.node.data);
  }

  onNodeUnselect(): void {
    this.formControl.reset();
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
    TranslateModule,
    PrimeNgTreeSelectModule,
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
