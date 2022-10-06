/*
 * RERO angular core
 * Copyright (C) 2020-2022 RERO
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

import { Component, Input, OnInit } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { Observable, of, Subscriber } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';

/**
 * For big editor add the possiblity to display
 */
@Component({
  selector: 'ng-core-editor-add-field-editor',
  templateUrl: './add-field-editor.component.html'
})
export class AddFieldEditorComponent implements OnInit {

  /** EditorComponent function */
  @Input() editorComponent: any;

  // current input value
  value: string;

  // current observables list of object suggestion for autocomplete
  typeaheadFields$: Observable<Array<FormlyFieldConfig>>;

  // editor service hidden fields list
  hiddenFields$: Observable<Array<FormlyFieldConfig>>;

  // editor service essential fields list
  essentialFields$: Observable<Array<FormlyFieldConfig>>;

  /** Instance of EditorComponent */
  //TODO: add type
  private editorComponentInstance;

  /***
   * Constructor
   * @param _translateService - TranslateService, that translate the labels of the hidden fields
   */
  constructor(
    private _translateService: TranslateService
  ) { }

  /** onInit hook */
  ngOnInit() {
    this.editorComponentInstance = (this.editorComponent)();
    this.typeaheadFields$ = new Observable((observer: Subscriber<string>) => {
      // Runs on every search
      observer.next(this.value);
    })
      .pipe(
        mergeMap((token: string) => this.getSuggestionsList(token))
      );

    this.hiddenFields$ = this.editorComponentInstance.hiddenFields$.pipe(
      map((fields: any[]) => fields.sort(
        (field1, field2) => this.sortFieldsByLabel(field1, field2)
      )
      )
    );

    this.essentialFields$ = this.hiddenFields$.pipe(
      map(fields =>
        fields
          .filter(f => this.isFieldEssential(f))
      )
    );
  }

  /**
   *
   * @param field1 first value to sort
   * @param field2 value to compare to
   */
  sortFieldsByLabel(field1: FormlyFieldConfig, field2: FormlyFieldConfig) {
    const f1 = field1.templateOptions.label;
    const f2 = field2.templateOptions.label;
    if (f1 > f2) {
      return 1;
    }
    if (f1 < f2) {
      return -1;
    }
    return 0;
  }

  /**
   * Generate the suggestion list for the autocomplete component.
   *
   * @param token string to filter the autocomplete list
   * @return an array of formly fields filtered by the current query
   */
  getSuggestionsList(token: string): Observable<Array<FormlyFieldConfig>> {
    // regex to filter the list
    if (token == null) {
      return of([]);
    }
    const spaceRegexp = new RegExp(/^\s+$/);
    const query = new RegExp(token, 'i');
    // take only the first value to avoid the selection still open after selection
    // const hiddenFieldsFirst$ = this.hiddenFields$.pipe(first());
    const hiddenFieldsFirst$ = this.editorComponentInstance.hiddenFields$.pipe(first());
    if (spaceRegexp.test(token)) {
      return hiddenFieldsFirst$;
    }
    return hiddenFieldsFirst$.pipe(
      map(
        (fields: any) => fields.filter(field => {
          // the label is not translated as the field is hidden
          const f = this._translateService.instant(field.templateOptions.untranslatedLabel);
          // true if match
          return query.test(f);
        })
      )
    );
  }

  /**
   * Translate the label of a given formly field.
   *
   * @param field ngx-formly field
   * @return the translated string
   */
  translateLabel(field: FormlyFieldConfig) {
    return this._translateService.stream(field.templateOptions.untranslatedLabel);
  }

  /***
   * Shows the selected field when it is selected
   * @param match - TypeaheadMatch, the selected element
   */
  itemSelected(match: TypeaheadMatch) {
    this.showSelectedField(match.item);
  }

  /***
   * Shows the selected field when it is selected
   * @param match - TyepeaheadMath, the selected element
   */
  showSelectedField(field: any) {
    // show the field in the form
    field.hide = false;
    // reset the input value
    this.value = undefined;
    // remove the the element from the list of hidden fields
    this.editorComponentInstance.removeHiddenField(field);
    // scroll at the right position
    // to avoid: Expression has changed after it was checked
    // See: https://blog.angular-university.io/angular-debugging/
    // wait that the component is present in the DOM
    setTimeout(() => this.editorComponentInstance.setFieldFocus(field, true));
  }

  /**
   * Filter fields to display only essential ones
   * @param field - field to check
   */
  isFieldEssential(field: FormlyFieldConfig) {
    return field.templateOptions.navigation &&
      field.templateOptions.navigation.essential === true;
  }
}
