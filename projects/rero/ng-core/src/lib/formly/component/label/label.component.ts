/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { Component, inject, OnDestroy, OnInit, input } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { merge, Subscription } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';
import { DropdownLabelEditorComponent } from '../dropdown-label-editor/dropdown-label-editor.component';
import { Button } from 'primeng/button';
import { TieredMenu } from 'primeng/tieredmenu';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'ng-core-label-editor',
    templateUrl: './label.component.html',
    imports: [NgTemplateOutlet, DropdownLabelEditorComponent, Button, TieredMenu, Tooltip]
})
export class LabelComponent implements OnInit, OnDestroy {
  protected translateService: TranslateService = inject(TranslateService);

  // Current field
  readonly field = input.required<FormlyFieldConfig>();

  // Subscriptions to observables.
  private subscriptions: Subscription = new Subscription();

  items: MenuItem[] = [];

  ngOnInit(): void {
    this.updateItems();
    // update items when the hidden state of the children change
    const fields = this.getFieldGroup(this.field());
    if (fields && fields?.length > 0) {
      this.subscriptions.add(
        merge(...fields.map(child => child.options?.fieldChanges))
          .subscribe(
            (changes: any) => {
            if (changes.type === 'hidden') {
              this.updateItems();
            }
        })
      );
      // update translations
      this.subscriptions.add(this.translateService.onLangChange.subscribe(() => this.updateItems()));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateItems(): void {
    const fieldValue = this.field();
    const fieldGroup = this.getFieldGroup(fieldValue);
    if (this.hasMenu(fieldValue) && fieldGroup) {
      this.items = [];
      this.hiddenFieldGroup(fieldGroup).map((field: any) => {
        if(!field.props.untranslatedLabel) {
          field.props.untranslatedLabel = field.props.label;
        }
        this.items.push({
          label: this.translateService.instant(field.props.untranslatedLabel),
          command: () => this.show(field),
        });
      });
    }
  }

  /**
   * Is the dropdown menu displayed?
   * @param field - FormlyFieldConfig, the corresponding form field config
   * @returns boolean, true if the menu should be displayed
   */
  hasMenu(field: FormlyFieldConfig): boolean {
    if (field?.fieldGroup?.[0]?.type === 'multischema') {
      return false;
    }
    const fieldValue = this.field();
    if (fieldValue.fieldGroup == null) {
      return false;
    }
    return (
      (this.hiddenFieldGroup(this.getFieldGroup(fieldValue)).length > 0 || fieldValue.props?.helpURL) &&
      field.props?.editorConfig?.longMode
    );
  }

  /** Get the current field index position in the parent array.
   *
   * @returns number - the index position in the parent array, null if the parent
   *                   is not an array.
   */
  getIndex(): number {
    const field = this.field();
    if (field?.parent?.type === 'array') {
      return Number(field.key);
    }
    return 0;
  }

  /** Get the list of children fields of a given field.
   *
   * This is more complicated for multischema, the formlyField should be extracted
   * from the children of children.
   *
   * @param field FormlyFieldConfig - the field to get the fieldGroup.
   * @returns Array of FormlyFieldConfig - the list of the children fields.
   */
  getFieldGroup(field: FormlyFieldConfig): FormlyFieldConfig[] | undefined {
    // multischema has a nested structure object['enum', 'object'], enum is the oneOf select
    // and object['object'] are all the possible oneOf entries
    // [0] is the enum i.e. (select) for the oneOf
    const multischemaFieldGroup = field.fieldGroup?.[0];
    if (multischemaFieldGroup?.type === 'multischema') {
      let activeGroups = multischemaFieldGroup.fieldGroup?.[1]?.fieldGroup;
      if(activeGroups?.length) {
        // only the active
        activeGroups = activeGroups.filter((f) => f.hide === false);
        return activeGroups
      }
    }
     return field.fieldGroup;
  }

  /**
   * Filter the fieldGroup to return the list of hidden field.
   * @param fieldGroup - FormlyFieldConfig[], the fieldGroup to filter
   * @returns FormlyFieldConfig[], the filtered list
   */
  hiddenFieldGroup(fieldGroup?: FormlyFieldConfig[]): FormlyFieldConfig[] {
    if (!fieldGroup) {
      return [];
    }
    return fieldGroup.filter((f) => f.hide && !(f?.expressions?.hide));
  }

  /**
   * Am I at the root of the form?
   * @returns boolean, true if I'm the root
   */
  isRoot(): boolean {
    return this.field().props?.isRoot || false;
  }

  /**
   * Hide the field
   * @param field - FormlyFieldConfig, the field to hide
   */
  remove(): void {
    const field = this.field();
    if (field?.parent?.type === 'object') {
      if (field.props?.setHide) {
        field.props.setHide(field, true);
      } else {
        field.hide = true;
      }
    }
    if (field?.parent?.type === 'array') {
      field.parent.props?.remove(this.getIndex());
    }
  }

  /**
   * Show the field
   * @param field - FormlyFieldConfig, the field to show
   */
  show(field: FormlyFieldConfig): void {
    if (field.props?.setHide) {
      field.props.setHide(field, false);
    } else {
      (field.hide = false);
    }
  }

  /**
   * Is the field can be hidden?
   * @returns boolean, true if the field can be hidden
   */
  canRemove(): boolean {
    const field = this.field();
    switch (field.parent?.type) {
      case 'object':
        if (!field.props?.editorConfig?.longMode) {
          return false;
        }
        return !field.props.required && !field.hide;
      case 'array':
        return field.parent.props?.canRemove();
      default:
        return false;
    }
  }

  /**
   * Is a new item can be added in an array?
   * Note that this is true only if the array does not contains items, else the
   * clone button should be used.
   * @returns boolean, true if a new item can be added
   */
  canAddItem(): boolean {
    const field = this.field();
    if (field.type === 'array' && field.props?.canAdd) {
      return field.props.canAdd() && field.fieldGroup?.length === 0;
    }
    return false;
  }

  /**
   * Add a new item element
   * @param field - FormlyFieldConfig, the field to hide
   */
  addItem(): void {
    const field = this.field();
    if (field.type === 'array') {
      return field.props?.add(0);
    }
  }

  /**
   * Is a array item can be cloned?
   * @returns boolean, true if the field can be hidden
   */
  canAdd(): boolean {
    const field = this.field();
    if (field.parent?.type === 'array') {
      return field.parent.props?.canAdd();
    }
    return false;
  }

  /**
   * Add a array item after the current field.
   * @param field - FormlyFieldConfig, the field to hide
   */
  add(): void {
    const field = this.field();
    const index = this.getIndex();
    if (field.parent?.type === 'array' && index !== null) {
      return field.parent.props?.add(index+ 1);
    }
  }
}
