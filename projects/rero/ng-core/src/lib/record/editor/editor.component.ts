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
import { ActivatedRoute, Router } from '@angular/router';
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
import { SubmitComponent } from './submit/submit.component';
import { RecordUiService } from '../record-ui.service';


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
    @Inject(CustomBootstrap4Framework) protected bootstrap4framework,
    protected route: ActivatedRoute,
    protected recordService: RecordService,
    protected recordUiService: RecordUiService,
    protected widgetLibrary: WidgetLibraryService,
    protected translateService: TranslateService,
    protected location: Location,
    protected toastrService: ToastrService,
    protected frameworkLibrary: FrameworkLibraryService,
    protected router: Router
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
    this.widgetLibrary.registerWidget('submit', SubmitComponent);

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
        this.recordUiService.types = this.route.snapshot.data.types;
        const config = this.recordUiService.getResourceConfig(this.recordType);

        this.pid = params.pid;
        if (!this.pid) {
          this.recordService
            .getSchemaForm(this.recordType)
            .subscribe(schemaForm => {
              this.schemaForm = schemaForm;
              this.schemaForm.data = this.preprocessRecordEditor(undefined, config);
            });
        } else {
          this.recordService.getRecord(this.recordType, this.pid).subscribe(record => {
            this.recordUiService.types = this.route.snapshot.data.types;
            this.recordUiService.canUpdateRecord$(record, this.recordType).subscribe(result => {
              if (result.can === false) {
                this.toastrService.error(
                  this.translateService.instant('You cannot update this record'),
                  this.translateService.instant(this.recordType)
                );
                this.location.back();
              }
            });

            this.recordService
              .getSchemaForm(this.recordType)
              .subscribe(schemaForm => {
                this.schemaForm = schemaForm;
                this.schemaForm.data = this.preprocessRecordEditor(record.metadata, config);
              });
          });
        }
      });
  }

  /**
   * Preprocess the record before passing it to the editor
   * @param record - Record object to preprocess
   * @param config - Object configuration for the current type
   */
  private preprocessRecordEditor(record, config) {
    if (config.preprocessRecordEditor) {
      // Does not works for documents
      if (record == null) {
        record = {};
      }
      return config.preprocessRecordEditor(record);
    }
    return record;
  }

  /**
   * Save a record by calling the API
   * @param record - Record to save
   */
  public save(record: any) {
    if (this.pid) {
      this.recordService.update(this.recordType, record).subscribe(res => {
        this.toastrService.success(
          this.translateService.instant('Record Updated!'),
          this.translateService.instant(this.recordType)
        );
        this.recordUiService.redirectAfterSave(this.pid, record, this.recordType, 'update', this.route);

      });
    } else {
      this.recordService.create(this.recordType, record).subscribe(res => {
        this.toastrService.success(
          this.translateService.instant('Record Created with pid: ') + res.metadata.pid,
          this.translateService.instant(this.recordType)
        );
        this.recordUiService.redirectAfterSave(res.metadata.pid, record, this.recordType, 'create', this.route);
      });
    }
  }

  /**
   * Cancel editing and back to previous page
   */
  public cancel() {
    this.location.back();
  }

}
