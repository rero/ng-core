/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { Component, computed, inject, OnDestroy, OnInit, signal, WritableSignal, input, viewChild } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { SelectChangeEvent } from 'primeng/select';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Listbox } from 'primeng/listbox';
import { EditorComponent } from '../../../record';
import { JsonObject } from '../../../model';

/**
 * For big editor add the possibility to display
 */
@Component({
    selector: 'ng-core-editor-add-field-editor',
    templateUrl: './add-field-editor.component.html',
    imports: [AutoComplete, Listbox, TranslatePipe]
})
export class AddFieldEditorComponent <TMetadata extends JsonObject = JsonObject> implements OnInit, OnDestroy {

  protected translateService: TranslateService = inject(TranslateService);

  /** Instance of EditorComponent */
  readonly editorComponent = input.required<EditorComponent<TMetadata>>();

  items: WritableSignal<FormlyFieldConfig[]> = signal([]);

  suggestions: FormlyFieldConfig[] = [];

  // Subscriptions to observables.
  private subscriptions: Subscription = new Subscription();

  essentialsOptions = computed(() => (this.items() ?? [])
          .filter(f => this.isFieldEssential(f)));

  readonly autocomplete = viewChild<AutoComplete>("addField");

  onAddField(event: SelectChangeEvent): void {
    this.editorComponent().setHide(event.value, false, true);
  }

  /** onInit hook */
  ngOnInit(): void {
    this.subscriptions.add(this.editorComponent().hiddenFields$.pipe(
      tap((fields: any) => this.fieldsTranslate(fields))
    ).subscribe());

    this.subscriptions.add(this.translateService.onLangChange.pipe(
      tap(() => this.fieldsTranslate(this.items()))
    ).subscribe());
  }

  /** onDestroy hook */
  ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
  }

  search(event: AutoCompleteCompleteEvent): void {
    this.suggestions = this.items().filter((item: any) => {
      return item.props.label.toLowerCase().indexOf(event.query.toLowerCase()) > -1
    }
    );
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    this.editorComponent().setHide(event.value, false);
    this.autocomplete()?.clear();
  }

  /**
   * Filter fields to display only essential ones
   * @param field - field to check
   */
  isFieldEssential(field: FormlyFieldConfig) {
    return field.props?.navigation && field.props.navigation.essential === true;
  }

  fieldsTranslate(fields: FormlyFieldConfig[]) {
    this.items.set(
      fields
        .map(field =>  {
          if(field.props?.label) {
            field.props.label = this.translateService.instant(field.props.untranslatedLabel);
          }
          return field;
        })
        .sort((field1: FormlyFieldConfig, field2: FormlyFieldConfig) => field1.props?.label?.localeCompare(field2.props?.label || '') || 0))
  }
}
