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
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { merge } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';
import { DropdownLabelEditorComponent } from '../dropdown-label-editor/dropdown-label-editor.component';
import { Button } from 'primeng/button';
import { TieredMenu } from 'primeng/tieredmenu';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'ng-core-label-editor',
  templateUrl: './label.component.html',
  imports: [NgTemplateOutlet, DropdownLabelEditorComponent, Button, TieredMenu, Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent {
  protected translateService: TranslateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  // Current field
  readonly field = input.required<FormlyFieldConfig>();

  items = signal<MenuItem[]>([]);

  // Tracks props.required reactively — Formly mutates props directly (plain JS),
  // so we subscribe to fieldChanges to propagate the change into a signal.
  readonly required = signal(false);

  readonly isRoot = computed(() => this.field().props?.isRoot ?? false);

  readonly getIndex = computed(() => {
    const field = this.field();
    return field?.parent?.type === 'array' ? Number(field.key) : 0;
  });

  // Writable signal — Formly mutates fieldGroup items (hide flag) without changing the field
  // reference, so computed() would not recompute. Updated explicitly via fieldChanges subscriptions.
  readonly hasMenu = signal(false);

  // Writable signal — field.hide is mutated directly by Formly without changing the field reference.
  readonly canRemove = signal(false);

  readonly canAdd = computed(() => {
    const field = this.field();
    if (field.parent?.type === 'array') {
      return field.parent.props?.canAdd();
    }
    return false;
  });

  // Writable signal — field.fieldGroup array is mutated (items added/removed) without reference change.
  readonly canAddItem = signal(false);

  constructor() {
    // Update items when field changes or its children's hidden state changes.
    // Also tracks props.required via fieldChanges (Formly mutates props directly).
    effect((onCleanup) => {
      const field = this.field();
      this.required.set(field.props?.required ?? false);
      this._updateHasMenu();
      this._updateCanRemove();
      this._updateCanAddItem();
      this.updateItems();

      const subs: (() => void)[] = [];

      if (field.options?.fieldChanges) {
        const sub = field.options.fieldChanges.subscribe(() => {
          this.required.set(field.props?.required ?? false);
          this._updateCanRemove();
          this._updateCanAddItem();
        });
        subs.push(() => sub.unsubscribe());
      }

      const fields = this.getFieldGroup(field);
      if (fields?.length) {
        const sub = merge(...fields.map((child) => child.options?.fieldChanges)).subscribe((changes) => {
          if (changes.type === 'hidden') {
            this._updateHasMenu();
            this.updateItems();
          }
        });
        subs.push(() => sub.unsubscribe());
      }

      onCleanup(() => subs.forEach((fn) => fn()));
    });

    // Update items on language change
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateItems());
  }

  private _updateCanRemove(): void {
    const field = this.field();
    switch (field.parent?.type) {
      case 'object':
        if (!field.props?.editorConfig?.longMode) {
          this.canRemove.set(false);
          return;
        }
        this.canRemove.set(!this.required() && !field.hide);
        return;
      case 'array':
        this.canRemove.set(field.parent.props?.canRemove());
        return;
      default:
        this.canRemove.set(false);
    }
  }

  private _updateCanAddItem(): void {
    const field = this.field();
    if (field.type === 'array' && field.props?.canAdd) {
      this.canAddItem.set(field.props.canAdd() && field.fieldGroup?.length === 0);
    } else {
      this.canAddItem.set(false);
    }
  }

  private _updateHasMenu(): void {
    const field = this.field();
    if (field?.fieldGroup?.[0]?.type === 'multischema' || field.fieldGroup == null) {
      this.hasMenu.set(false);
      return;
    }
    this.hasMenu.set(
      !!(
        (this.hiddenFieldGroup(this.getFieldGroup(field)).length > 0 || field.props?.helpURL) &&
        field.props?.editorConfig?.longMode
      ),
    );
  }

  updateItems(): void {
    const field = this.field();
    const fieldGroup = this.getFieldGroup(field);
    if (this.hasMenu() && fieldGroup) {
      this.items.set(
        this.hiddenFieldGroup(fieldGroup).map((f: any) => {
          if (!f.props.untranslatedLabel) {
            f.props.untranslatedLabel = f.props.label;
          }
          return {
            label: this.translateService.instant(f.props.untranslatedLabel),
            command: () => this.show(f),
          };
        }),
      );
    }
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
      if (activeGroups?.length) {
        activeGroups = activeGroups.filter((f) => f.hide === false);
        return activeGroups;
      }
    }
    return field.fieldGroup;
  }

  /**
   * Filter the fieldGroup to return the list of hidden fields.
   * @param fieldGroup - FormlyFieldConfig[], the fieldGroup to filter
   * @returns FormlyFieldConfig[], the filtered list
   */
  hiddenFieldGroup(fieldGroup?: FormlyFieldConfig[]): FormlyFieldConfig[] {
    if (!fieldGroup) {
      return [];
    }
    return fieldGroup.filter((f) => f.hide && !f?.expressions?.hide);
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
      field.hide = false;
    }
  }

  /**
   * Add a new item element
   */
  addItem(): void {
    const field = this.field();
    if (field.type === 'array') {
      field.props?.add(0);
    }
  }

  /**
   * Add a array item after the current field.
   */
  add(): void {
    const field = this.field();
    if (field.parent?.type === 'array') {
      field.parent.props?.add(this.getIndex() + 1);
    }
  }
}
