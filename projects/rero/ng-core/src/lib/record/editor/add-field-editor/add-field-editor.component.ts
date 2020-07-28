/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { Observable, of, Subscriber, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { EditorService } from '../editor.service';

/**
 * For big editor add the possiblity to display
 */
@Component({
  selector: 'ng-core-editor-add-field-editor',
  templateUrl: './add-field-editor.component.html'
})
export class AddFieldEditorComponent implements OnInit, OnDestroy {

  // current input value
  value: string;

  // current list of object suggestion for autocomplete
  typeaheadFields: Array<FormlyFieldConfig>;

  // current observables list of object suggestion for autocomplete
  typeaheadFields$: Observable<Array<FormlyFieldConfig>>;

  // editor servide hidden fields list
  hiddenFields$: Observable<Array<FormlyFieldConfig>>;

  // subscribers
  private _subscribers: Subscription[] = [];

  /***
   * Constructor
   * @param _editorService - EditorService, that keep the list of hidden fields
   * @param _translateService - TranslateService, that translate the labels of the hidden fields
   */
  constructor(
    private _editorService: EditorService,
    private _translateService: TranslateService
  ) {
    this.hiddenFields$ = this._editorService.hiddenFields$;
    this._subscribers.push(
      this.hiddenFields$.subscribe(fields => this.typeaheadFields = fields));
    this.typeaheadFields$ = new Observable((observer: Subscriber<string>) => {
      // Runs on every search
      observer.next(this.value);
    })
      .pipe(
        mergeMap((token: string) => this.getSuggestionsList(token))
      );
  }

  /**
   * Component destruction
   */
  ngOnDestroy() {
    this._subscribers.forEach(s => s.unsubscribe());
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
    if (spaceRegexp.test(token)) {
      return of(this.typeaheadFields);
    }
    return of(
      this.typeaheadFields.filter(field => {
        // the label is not translated as the field is hidden
        const f = this._translateService.instant(field.templateOptions.untranslatedLabel);
        // true if match
        return query.test(f);
      })
    );
  }

  /***
   * Component init
   */
  ngOnInit() {
    // avoid duplicate when switching between page
    this._editorService.clearHiddenFields();
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
    this._editorService.removeHiddenField(field);
    // scroll at the right position
    // to avoid: Expression has changed after it was checked
    // See: https://blog.angular-university.io/angular-debugging/
    // wait that the component is present in the DOM
    setTimeout(() => this._editorService.setFocus(field, true));
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
