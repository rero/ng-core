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
import { Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/**
 * For big editor add the possibility to display
 */
@Component({
  selector: 'ng-core-editor-add-field-editor',
  templateUrl: './add-field-editor.component.html'
})
export class AddFieldEditorComponent implements OnInit, OnDestroy {

  protected translateService: TranslateService = inject(TranslateService);

  /** EditorComponent function */
  @Input() editorComponent: any;

  searchValue: string | undefined;

  items: any[] = [];

  suggestions: any[] | undefined;

  /** Instance of EditorComponent */
  private editorComponentInstance: any;

  // Subscriptions to observables.
  private subscriptions: Subscription = new Subscription();

  essentialsOptions = [];

  @ViewChild("addField") autocomplete: AutoComplete;

  onAddField(event: DropdownChangeEvent): void {
    this.editorComponentInstance.setHide(event.value, false);
  }

  /** onInit hook */
  ngOnInit() {
    this.editorComponentInstance = (this.editorComponent)();

    this.subscriptions.add(this.editorComponentInstance.hiddenFields$.pipe(
      map((fields: any[]) => fields.sort(
        (field1, field2) => field1.props.label.localeCompare(field2.props.label)
      )),
      tap((fields: any[]) => this.items = fields),
      tap((fields: any[]) => {
        this.essentialsOptions = fields
          .filter(f => this.isFieldEssential(f))
          .map((field: any) => {
            return { label: this.translateService.instant(field.props.untranslatedLabel), value: field }
          });

      })
    ).subscribe());
  }

  /** onDestroy hook */
  ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
  }

  search(event: AutoCompleteCompleteEvent): void {
    this.suggestions = this.items.filter((item: any) =>
      item.props.label.toLowerCase().indexOf(event.query.toLowerCase()) === 0
    );
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    this.editorComponentInstance.setHide(event.value, false);
    this.autocomplete.clear();
  }

  /**
   * Translate the label of a given formly field.
   *
   * @param field ngx-formly field
   * @return the translated string
   */
  translateLabel(field: FormlyFieldConfig): Observable<string | any> {
    return this.translateService.stream(field.props.untranslatedLabel);
  }

  /**
   * Filter fields to display only essential ones
   * @param field - field to check
   */
  isFieldEssential(field: FormlyFieldConfig) {
    return field.props.navigation && field.props.navigation.essential === true;
  }
}
