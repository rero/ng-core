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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup, FormControl } from '@angular/forms';
import { JSONSchema7 } from 'json-schema';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { EditorService } from './editor.service';
import { orderedJsonSchema, isEmpty, removeEmptyValues } from './utils';
import { RecordService } from '../record.service';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { RecordUiService } from '../record-ui.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { ApiService } from '../../api/api.service';

@Component({
  selector: 'ng-core-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  // angular formGroop root
  form: FormGroup;

  // initial data
  model: any = {};

  // additionnal form options
  options: FormlyFormOptions;

  // form configuration
  fields: FormlyFieldConfig[];

  // list of fields to display in the TOC
  tocFields = [];

  // JSONSchema
  schema: any;

  // mode for long editor
  longMode = false;

  // current record type from the url
  public recordType = null;

  // store pid on edit mode
  public pid = null;

  // subscribers
  private _subscribers: Subscription[] = [];

  /**
   * Constructor
   * @param formlyJsonschema - FormlyJsonschema, the ngx-fomly jsonschema service
   */
  constructor(
    private formlyJsonschema: FormlyJsonschema,
    private recordService: RecordService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private editorService: EditorService,
    private recordUiService: RecordUiService,
    private translateService: TranslateService,
    private toastrService: ToastrService,
    private location: Location
  ) {
    this.form = new FormGroup({});
  }

  /**
   * Component initialisation
   */
  ngOnInit() {
    combineLatest(this.route.params, this.route.queryParams)
      .pipe(map(results => ({ params: results[0], query: results[1] })))
      .subscribe(results => {
        const params = results.params;
        // uncomment for debug
        // this.form.valueChanges.subscribe(v =>
        //   console.log('model', this.model, 'v', v, 'form', this.form)
        // );

        this.recordType = params.type;
        this.recordUiService.types = this.route.snapshot.data.types;
        const config = this.recordUiService.getResourceConfig(this.recordType);
        if (config.editorLongMode === true) {
          this.longMode = true;
        }
        this.pid = params.pid;
        // edition
        if (this.pid) {
          this.recordService
            .getRecord(this.recordType, this.pid)
            .subscribe(record => {
              this.recordUiService
                .canUpdateRecord$(record, this.recordType)
                .subscribe(result => {
                  if (result.can === false) {
                    this.toastrService.error(
                      this.translateService.instant(
                        'You cannot update this record'
                      ),
                      this.translateService.instant(this.recordType)
                    );
                    this.location.back();
                  }
                });
              this.model = this.preprocessRecord(record.metadata);
              this.recordService
                .getSchemaForm(this.recordType)
                .subscribe(schemaform => {
                  this.setSchema(schemaform.schema);
                });
            });
        } else {
          // creation
          this.model = this.preprocessRecord(this.model);
          this.recordService
            .getSchemaForm(this.recordType)
            .subscribe(schemaform => {
              this.setSchema(schemaform.schema);
            });
        }
      });
  }

  /**
   * Component destruction
   */
  ngOnDestroy() {
    for (const s of this._subscribers) {
      s.unsubscribe();
    }
  }

  /**
   * Preprocess the record before passing it to the editor
   * @param record - Record object to preprocess
   */
  private preprocessRecord(record) {
    const config = this.recordUiService.getResourceConfig(this.recordType);

    if (config.preprocessRecordEditor) {
      return config.preprocessRecordEditor(record);
    }
    return record;
  }

  /**
   * Postprocess the record before save
   * @param record - Record object to postprocess
   */
  private postprocessRecord(record: any) {
    const config = this.recordUiService.getResourceConfig(this.recordType);

    if (config.postprocessRecordEditor) {
      return config.postprocessRecordEditor(record);
    }
    return record;
  }

  /**
   * Pre Create Record
   * @param record - Record object
   */
  private preCreateRecord(record: any) {
    const config = this.recordUiService.getResourceConfig(this.recordType);

    if (config.preCreateRecord) {
      return config.preCreateRecord(record);
    }
    return record;
  }

  /**
   * Pre Update Record
   * @param record - Record object
   */
  private preUpdateRecord(record: any) {
    const config = this.recordUiService.getResourceConfig(this.recordType);

    if (config.preUpdateRecord) {
      return config.preUpdateRecord(record);
    }
    return record;
  }

  /**
   * Preprocess the record before passing it to the editor
   * @param schema - object, JOSNSchema
   */
  setSchema(schema) {
    // reorder all object properties
    this.schema = orderedJsonSchema(schema);
    this.options = {};

    // form configuration
    const fields = [
      this.formlyJsonschema.toFieldConfig(this.schema, {
        // post process JSONSChema7 to FormlyFieldConfig conversion
        map: (field: FormlyFieldConfig, jsonSchema: JSONSchema7) => {

          /**** additionnal JSONSchema configurations *******/
          // initial population of arrays with a minItems constraints
          if (jsonSchema.minItems && !jsonSchema.hasOwnProperty('default')) {
            field.defaultValue = new Array(jsonSchema.minItems);
          }
          const formOptions = jsonSchema.form;

          if (formOptions) {
            this.setSimpleOptions(field, formOptions);
            this.setValidation(field, formOptions);
            this.setRemoteSelectOptions(field, formOptions);
          }

          // show the field if the model contains a value usefull for edition
          field.hooks = {
            ...field.hooks,
            onInit: f => {
              let model = f.model;
              // for simple object the model is the parent dict
              if (!['object', 'multischema', 'array'].some(v => v === f.type)) {
                model = f.model[f.key];
              }
              if (
                f.templateOptions.hide === true &&
                isEmpty(removeEmptyValues(model)) === false
              ) {
                // to avoid: Expression has changed after it was checked
                // See: https://blog.angular-university.io/angular-debugging
                setTimeout(() => {
                  f.hide = false;
                  this.editorService.removeHiddenField(f);
                });
              }
            }
          };

          field.templateOptions.longMode = this.longMode;

          // add a form-field wrapper for boolean (switch)
          if (field.type === 'boolean') {
            field.wrappers = [
              ...(field.wrappers ? field.wrappers : []),
              'form-field'
            ];
          }

          return field;
        }
      })
    ];
    this.fields = fields;
    if (this.longMode) {
      this._subscribers.push(
        this.form.statusChanges.subscribe(() => this.getTocFields())
      );
    }
  }

  /**
   * Save the data on the server.
   * @param event - object, JSON to POST on the backend
   */
  submit(event) {
    let data = removeEmptyValues(this.model);
    data = this.postprocessRecord(data);
    if (data.pid != null) {
      this.recordService.update(this.recordType, this.preUpdateRecord(data)).subscribe((record) => {
        this.toastrService.success(
          this.translateService.instant('Record Updated!'),
          this.translateService.instant(this.recordType)
        );
        this.recordUiService.redirectAfterSave(this.pid, record, this.recordType, 'update', this.route);

      });
    } else {
      this.recordService.create(this.recordType, this.preCreateRecord(data)).subscribe(record => {
        this.toastrService.success(
          this.translateService.instant('Record Created with pid: ') +
            record.metadata.pid,
          this.translateService.instant(this.recordType)
        );
        this.recordUiService.redirectAfterSave(record.metadata.pid, record, this.recordType, 'create', this.route);
      });
    }
  }

  /**
   * Scroll the window in to the DOM element corresponding to a given config field.
   * @param event - click DOM event
   * @param field - FormlyFieldConfig, the form config corresponding to the DOM element to jump to.
   */
  setFocus(event, field: FormlyFieldConfig) {
    event.preventDefault();
    this.editorService.setFocus(field, true);
  }

  /**
   * Populate the field to add to the TOC
   */
  getTocFields() {
    setTimeout(
      () =>
        (this.tocFields = this.fields[0].fieldGroup.filter(
          f => f.hide !== true
        ))
    );
  }

  /**
   * Cancel editing and back to previous page
   */
  public cancel() {
    this.location.back();
  }

  /********************* Private  ***************************************/

  /**
   * Populate a select options with a remote API call.
   * @param field formly field config
   * @param formOptions JSONSchema object
   */
  private setRemoteSelectOptions(
    field: FormlyFieldConfig,
    formOptions: JSONSchema7
  ) {
    if (formOptions.remoteOptions && formOptions.remoteOptions.type) {
      field.type = 'select';
      field.hooks = {
        ...field.hooks,
        afterContentInit: (f: FormlyFieldConfig) => {
          const recordType = formOptions.remoteOptions.type;
          f.templateOptions.options = this.recordService
            .getRecords(recordType, '', 1, RecordService.MAX_REST_RESULTS_SIZE)
            .pipe(
              map(data =>
                data.hits.hits.map(record => {
                  return {
                    label: record.metadata.name,
                    value: this.apiService.getRefEndpoint(
                      recordType,
                      record.metadata.pid
                    )
                  };
                }
              )
            )
          );
        }
      };
    }
  }

  /**
   *
   * @param field formly field config
   * @param formOptions JSONSchema object
   */
  private setValidation(field: FormlyFieldConfig, formOptions: JSONSchema7) {
    if (formOptions.validation) {
      // custom validation messages
      const messages = formOptions.validation.messages;
      if (messages) {
        if (!field.validation) {
          field.validation = {};
        }
        if (!field.validation.messages) {
          field.validation.messages = {};
        }
        for (const key of Object.keys(messages)) {
          field.validation.messages[key] = (error, f: FormlyFieldConfig) =>
            `${messages[key]}`;
        }
      }
      // custom validators
      if (
        formOptions.validation.validators &&
        formOptions.validation.validators.valueAlreadyExists
      ) {
        const remoteRecordType =
          formOptions.validation.validators.valueAlreadyExists.remoteRecordType;
        const limitToValues =
          formOptions.validation.validators.valueAlreadyExists.limitToValues;
        const filter =
          formOptions.validation.validators.valueAlreadyExists.filter;
        const term =
          formOptions.validation.validators.valueAlreadyExists.term;
        field.asyncValidators = {
          validation: [
            (control: FormControl) => {
              return this.recordService.uniqueValue(
                field,
                remoteRecordType ? remoteRecordType : this.recordType,
                this.pid ? this.pid : null,
                term ? term : null,
                limitToValues ? limitToValues : [],
                filter ? filter : null
              );
            }
          ]
        };
      }
    }
  }

  /**
   * Convert JSONSchema form options to formly field options.
   * @param field formly field config
   * @param formOptions JSONSchema object
   */
  private setSimpleOptions(field: FormlyFieldConfig, formOptions: JSONSchema7) {
    // ngx formly standard options
    // hide a field at startup
    if (formOptions.hide === true) {
      field.templateOptions.hide = true;
      setTimeout(() => field.hide = true);
    }
    // wrappers
    if (formOptions.wrappers && formOptions.wrappers.length > 0) {
      field.wrappers = [
        ...(field.wrappers ? field.wrappers : []),
        ...formOptions.wrappers
      ];
    }
    // custom type
    if (formOptions.type != null) {
      field.type = formOptions.type;
    }
    // put the focus in this field
    if (formOptions.focus === true) {
      field.focus = true;
    }
    // input placeholder
    if (formOptions.placeholder) {
      field.templateOptions.placeholder = formOptions.placeholder;
    }
    // select labels and values
    if (formOptions.options) {
      field.templateOptions.options = formOptions.options;
    }
    // expression properties
    if (formOptions.expressionProperties) {
      field.expressionProperties = formOptions.expressionProperties;
    }
    // hide expression
    if (formOptions.hideExpression) {
      field.hideExpression = formOptions.hideExpression;
    }

    // non ngx formly options
    // custom help URL displayed  in the object dropdown
    if (formOptions.helpURL) {
      field.templateOptions.helpURL = formOptions.helpURL;
    }
    // custom field for navigation options
    if (formOptions.navigation) {
      field.templateOptions.navigation = formOptions.navigation;
    }
  }
}
