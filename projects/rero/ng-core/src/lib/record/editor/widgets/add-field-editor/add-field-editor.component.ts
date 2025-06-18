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
import { Component, computed, inject, Input, OnDestroy, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { SelectChangeEvent } from 'primeng/select';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * For big editor add the possibility to display
 */
@Component({
    selector: 'ng-core-editor-add-field-editor',
    templateUrl: './add-field-editor.component.html',
    standalone: false
})
export class AddFieldEditorComponent implements OnInit, OnDestroy {

  protected translateService: TranslateService = inject(TranslateService);

  /** EditorComponent function */
  @Input() editorComponent: any;

  searchValue: string | undefined;

  items: WritableSignal<any[]> = signal([]);

  suggestions: any[] | undefined;

  /** Instance of EditorComponent */
  private editorComponentInstance: any;

  // Subscriptions to observables.
  private subscriptions: Subscription = new Subscription();

  essentialsOptions = computed(() => this.items()
          .filter(f => this.isFieldEssential(f)));

  @ViewChild("addField") autocomplete: AutoComplete;

  onAddField(event: SelectChangeEvent): void {
    this.editorComponentInstance.setHide(event.value, false);
  }

  /** onInit hook */
  ngOnInit() {
    this.editorComponentInstance = (this.editorComponent)();

    this.subscriptions.add(this.editorComponentInstance.hiddenFields$.pipe(
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
    this.editorComponentInstance.setHide(event.value, false);
    this.autocomplete.clear();
  }

  /**
   * Filter fields to display only essential ones
   * @param field - field to check
   */
  isFieldEssential(field: FormlyFieldConfig) {
    return field.props?.navigation && field.props.navigation.essential === true;
  }

  fieldsTranslate(fields: any) {
    this.items.set(
      fields
        .map((field: any) =>  {
          field.props.label = this.translateService.instant(field.props.untranslatedLabel);
          return field;
        })
        .sort((field1, field2) => field1.props.label.localeCompare(field2.props.label)))
  }
}
