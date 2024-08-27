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
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * For big editor add the possibility to display
 */
@Component({
  selector: 'ng-core-editor-add-field-editor',
  templateUrl: './add-field-editor.component.html'
})
export class AddFieldEditorComponent implements OnInit, OnDestroy {

  /** Service injection */
  private translateService = inject(TranslateService);

  /** EditorComponent function */
  @Input() editorComponent: any;

  currentValue: string = '';

  searchValue: string | undefined;

  items: any[] = [];

  suggestions: any[] | undefined;

  // editor service hidden fields list
  hiddenFields$: Observable<Array<FormlyFieldConfig>>;

  // editor service essential fields list
  essentialFields$: Observable<Array<FormlyFieldConfig>>;

  /** Instance of EditorComponent */
  //TODO: add type
  private editorComponentInstance: any;

  // Subscriptions to observables.
  private subscriptions: Subscription = new Subscription();

  /** onInit hook */
  ngOnInit() {
    this.editorComponentInstance = (this.editorComponent)();

    this.hiddenFields$ = this.editorComponentInstance.hiddenFields$.pipe(
      map((fields: any[]) => fields.sort(
        (field1, field2) => this.sortFieldsByLabel(field1, field2)
      ))
    );

    this.essentialFields$ = this.hiddenFields$.pipe(
      map(fields =>
        fields
          .filter(f => this.isFieldEssential(f))
      )
    );

    this.subscriptions.add(
      this.editorComponentInstance.hiddenFields$.pipe(
        map((fields: any[]) => fields.sort(
          (field1, field2) => this.sortFieldsByLabel(field1, field2)
        ))
      ).subscribe((fields: any[]) => this.items = fields)
    );
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
    // needed for the dropdown selection
    setTimeout(() => this.currentValue = '');
  }

  addField(field: any): void {
    this.editorComponentInstance.setHide(field, false);
  }

  /**
   *
   * @param field1 first value to sort
   * @param field2 value to compare to
   */
  sortFieldsByLabel(field1: FormlyFieldConfig, field2: FormlyFieldConfig): number {
    const f1 = field1.props.label;
    const f2 = field2.props.label;
    if (f1 > f2) {
      return 1;
    }
    if (f1 < f2) {
      return -1;
    }
    return 0;
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
    return field.props.navigation &&
      field.props.navigation.essential === true;
  }
}
