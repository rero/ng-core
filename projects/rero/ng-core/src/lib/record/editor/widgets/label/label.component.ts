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
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { merge, Subscription } from 'rxjs';

@Component({
    selector: 'ng-core-label-editor',
    templateUrl: './label.component.html',
    standalone: false
})
export class LabelComponent implements OnInit, OnDestroy {
  protected translateService: TranslateService = inject(TranslateService);

  // Current field
  @Input() field: FormlyFieldConfig;

  // Subscriptions to observables.
  private subscriptions: Subscription = new Subscription();

  items: MenuItem[] = [];

  ngOnInit(): void {
    this.updateItems();
    // update items when the hidden state of the children change
    const fields = this.getFieldGroup(this.field);
    if (fields?.length > 0) {
      this.subscriptions.add(
        merge(...fields.map((child: any) => child.options.fieldChanges))
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

  updateItems() {
    if (this.hasMenu(this.field)) {
      this.items = [];
      this.hiddenFieldGroup(this.getFieldGroup(this.field)).map((field: any) => {
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
    if (field.fieldGroup && field.fieldGroup.length > 0 && field.fieldGroup[0].type === 'multischema') {
      return false;
    }
    if (this.field.fieldGroup == null) {
      return false;
    }
    return (
      (this.hiddenFieldGroup(this.getFieldGroup(this.field)).length > 0 || this.field.props.helpURL) &&
      field.props?.editorConfig?.longMode
    );
  }

  /** Get the current field index position in the parent array.
   *
   * @returns number - the index position in the parent array, null if the parent
   *                   is not an array.
   */
  getIndex() {
    if (this.field.parent.type === 'array') {
      return Number(this.field.key);
    }
    return null;
  }

  /** Get the list of children fields of a given field.
   *
   * This is more complicated for multischema, the formlyField should be extracted
   * from the children of children.
   *
   * @param field FormlyFieldConfig - the field to get the fieldGroup.
   * @returns Array of FormlyFieldConfig - the list of the children fields.
   */
  getFieldGroup(field: FormlyFieldConfig) {
    let fieldGroup = [];
    // multischema has a nested structure object['enum', 'object'], enum is the oneOf select
    // and object['object'] are all the possible oneOf entries
    if (field.fieldGroup?.length > 0 && field.fieldGroup[0].type === 'multischema') {
      const multischemaFieldGroup = field.fieldGroup[0];
      // [0] is the enum i.e. (select) for the oneOf
      const multischemaEntries = multischemaFieldGroup.fieldGroup[1];
      let activeGroups = multischemaEntries.fieldGroup;
      // only the active
      activeGroups = activeGroups.filter((f) => f.hide === false);
      activeGroups.map((group) => (fieldGroup = [...group.fieldGroup, group]));
    } else {
      fieldGroup = field.fieldGroup;
    }
    return fieldGroup;
  }

  /**
   * Filter the fieldGroup to return the list of hidden field.
   * @param fieldGroup - FormlyFieldConfig[], the fieldGroup to filter
   * @returns FormlyFieldConfig[], the filtered list
   */
  hiddenFieldGroup(fieldGroup: FormlyFieldConfig[]): FormlyFieldConfig[] {
    return fieldGroup.filter((f) => f.hide && !('hide' in f?.expressions));
  }

  /**
   * Am I at the root of the form?
   * @returns boolean, true if I'm the root
   */
  isRoot(): boolean {
    return this.field.props?.isRoot || false;
  }

  /**
   * Hide the field
   * @param field - FormlyFieldConfig, the field to hide
   */
  remove(): void {
    if (this.field.parent.type === 'object') {
      this.field.props.setHide ? this.field.props.setHide(this.field, true) : (this.field.hide = true);
    }
    if (this.field.parent.type === 'array') {
      this.field.parent.props.remove(this.getIndex());
    }
  }

  /**
   * Show the field
   * @param field - FormlyFieldConfig, the field to show
   */
  show(field: FormlyFieldConfig) {
    field.props.setHide ? field.props.setHide(field, false) : (field.hide = false);
  }

  /**
   * Is the field can be hidden?
   * @returns boolean, true if the field can be hidden
   */
  canRemove(): boolean {
    switch (this.field.parent.type) {
      case 'object':
        if (!this.field.props?.editorConfig?.longMode) {
          return false;
        }
        return !this.field.props.required && !this.field.hide;
      case 'array':
        return this.field.parent.props.canRemove();
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
    if (this.field.type === 'array' && this.field.props.canAdd) {
      return this.field.props.canAdd() && this.field.fieldGroup.length === 0;
    }
    return false;
  }

  /**
   * Add a new item element
   * @param field - FormlyFieldConfig, the field to hide
   */
  addItem() {
    if (this.field.type === 'array') {
      return this.field.props.add(0);
    }
  }

  /**
   * Is a array item can be cloned?
   * @returns boolean, true if the field can be hidden
   */
  canAdd() {
    if (this.field.parent.type === 'array') {
      return this.field.parent.props.canAdd();
    }
    return false;
  }

  /**
   * Add a array item after the current field.
   * @param field - FormlyFieldConfig, the field to hide
   */
  add() {
    if (this.field.parent.type === 'array') {
      const index = this.getIndex() + 1;
      return this.field.parent.props.add(index);
    }
  }
}
