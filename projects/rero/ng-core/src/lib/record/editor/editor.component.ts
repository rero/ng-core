/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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

import { Component, OnInit, Inject } from '@angular/core';
import { WidgetLibraryService, FrameworkLibraryService, JsonPointer } from 'angular6-json-schema-form';
import { ActivatedRoute } from '@angular/router';
import { RecordService } from '../record.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { FieldsetComponent } from './fieldset/fieldset.component';
import { CustomBootstrap4Framework } from './bootstrap4-framework/custombootstrap4-framework';
import { MefComponent } from './mef/mef.component';
import { AddReferenceComponent } from './add-reference/add-reference.component';
import { RemoteSelectComponent } from './remote-select/remote-select.component';
import { RolesCheckboxesComponent } from './roles-checkboxes/roles-checkboxes.component';
import { RemoteInputComponent } from './remote-input/remote-input.component';
import { MainFieldsManagerComponent } from './main-fields-manager/main-fields-manager.component';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';


@Component({
  selector: 'ng-core-editor',
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit {
  public formOptions = {
    returnEmptyFields: false, // Don't return values for empty input fields
    setSchemaDefaults: true
  };

  public debugMode = true;
  public schemaForm = null;
  public recordType = undefined;
  public pid = undefined;
  public message = undefined;
  public data;
  public currentLocale = undefined;
  public formValidationErrors: any;
  private goToDetailedView = false;

  /**
   * Get validation errors for displaying in HTML
   */
  get prettyValidationErrors() {
    if (!this.formValidationErrors) { return null; }
    const errorArray = [];
    for (const error of this.formValidationErrors) {
      const message = error.message;
      const dataPathArray = JsonPointer.parse(error.dataPath);
      if (dataPathArray.length) {
        let field = dataPathArray[0];
        for (let i = 1; i < dataPathArray.length; i++) {
          const key = dataPathArray[i];
          field += /^\d+$/.test(key) ? `[${key}]` : `.${key}`;
        }
        errorArray.push(`${field}: ${message}`);
      } else {
        errorArray.push(message);
      }
    }
    return errorArray.join('<br>');
  }

  constructor(
    @Inject(CustomBootstrap4Framework) bootstrap4framework,
    private route: ActivatedRoute,
    private recordService: RecordService,
    private widgetLibrary: WidgetLibraryService,
    private translateService: TranslateService,
    private location: Location,
    private toastrService: ToastrService,
    private frameworkLibrary: FrameworkLibraryService
  ) {
    // TODO: remove this bad hack when the following PR will be integrated
    // https://github.com/hamzahamidi/Angular6-json-schema-form/pull/64
    this.frameworkLibrary.frameworkLibrary.custom = bootstrap4framework;

    this.widgetLibrary.registerWidget('fieldset', FieldsetComponent);
    this.widgetLibrary.registerWidget('select', RemoteSelectComponent);
    this.widgetLibrary.registerWidget('rolesCheckboxes', RolesCheckboxesComponent);
    this.widgetLibrary.registerWidget('text', RemoteInputComponent);
    this.widgetLibrary.registerWidget('refAuthority', MefComponent);
    this.widgetLibrary.registerWidget('$ref', AddReferenceComponent);
    this.widgetLibrary.registerWidget('main-fields-manager', MainFieldsManagerComponent);

    this.currentLocale = this.translateService.currentLang;
  }

  /**
   * Log debug messages
   * @param event - Event, DOM event
   */
  public debug(event: Event) {
    console.log(event);
  }

  /**
   * Init component
   */
  public ngOnInit() {
    // TODO: Check use of route.snapshot instead of observables
    combineLatest(this.route.params, this.route.queryParams)
      .pipe(map(results => ({ params: results[0], query: results[1] })))
      .subscribe(results => {
        const params = results.params;
        const query = results.query;

        this.recordType = params.type;

        this.pid = params.pid;
        try {
          this.goToDetailedView = Boolean(JSON.parse(query.go_to_detailed));
        } catch (e) {
          console.log(`unable to parse query option: ${query.go_to_detailed}`);
        }
        if (!this.pid) {
          this.recordService
            .getSchemaForm(this.recordType)
            .subscribe(schemaForm => {
              this.schemaForm = schemaForm;
            });
        } else {
          this.recordService.getRecord(this.recordType, this.pid).subscribe(record => {
            this.recordService
              .getSchemaForm(this.recordType)
              .subscribe(schemaForm => {
                this.schemaForm = schemaForm;
                this.schemaForm.data = record.metadata;
              });
          });
        }
      });
  }

  /**
   * Save a record by calling the API
   * @param record - Record to save
   */
  public save(record: any) {
    if (this.pid) {
      this.recordService.update(this.recordType, record).subscribe(res => {
        this.toastrService.success(
          _('Record Updated!'),
          _(this.recordType)
        );
        this.location.back();
      });
    } else {
      this.recordService.create(this.recordType, record).subscribe(res => {
        this.toastrService.success(
          _('Record Created with pid: ') + res.metadata.pid,
          _(this.recordType)
        );
        this.location.back();
      });
    }
  }

  /**
   * Cancel editing and back to previous page
   */
  public cancel() {
    this.location.back();
  }

  /**
   * Store errors in dedicated property
   * @param errors - array, list of errors
   */
  public validationErrors(errors: []) {
    this.formValidationErrors = errors;
  }
}
