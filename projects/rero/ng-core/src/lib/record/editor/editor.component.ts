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
import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { TranslateService } from '@ngx-translate/core';
import { JSONSchema7 } from 'json-schema';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { EditorService } from './editor.service';
import { isEmpty, orderedJsonSchema, removeEmptyValues } from './utils';

@Component({
  selector: 'ng-core-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  // make the style global: required by JSONSchema cssClass
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit, OnChanges, OnDestroy {

  // form intial values
  @Input() model: any = null;

  // initial values changes notification
  @Output() modelChange = new EventEmitter<any>();

  // editor loading state notifications
  @Output() loadingChange = new EventEmitter<boolean>();

  // angular formGroup root
  form: FormGroup;

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
  recordType = null;

  // store pid on edit mode
  pid = null;

  // subscribers
  private _subscribers: Subscription[] = [];

  // Config for resource
  private _resourceConfig: any;

  // Types to apply horizontal wrapper on
  private _horizontalWrapperTypes = [
    'enum',
    'string',
    'remoteautocomplete',
    'selectWithSort',
    'integer',
    'textarea'
  ];

  /**
   * Constructor.
   * @param _formlyJsonschema Formly JSON schema.
   * @param _recordService Record service.
   * @param _apiService API service.
   * @param _route Route.
   * @param _editorService Editor service.
   * @param _recordUiService Record UI service.
   * @param _translateService Translate service.
   * @param _toastrService Toast service.
   * @param _location Location.
   * @param _spinner Spinner service.
   */
  constructor(
    private _formlyJsonschema: FormlyJsonschema,
    private _recordService: RecordService,
    private _apiService: ApiService,
    private _route: ActivatedRoute,
    private _editorService: EditorService,
    private _recordUiService: RecordUiService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _location: Location,
    private _spinner: NgxSpinnerService
  ) {
    this.form = new FormGroup({});
  }

  /**
   * Component has changed
   * Called before ngOnInit() and whenever one of the input properties change.
   * @param changes: the changed properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.model && !changes.model.isFirstChange) { // Model has changed
      this._setModel(changes.model.currentValue);
    }
  }

  /**
   * Component initialisation
   */
  ngOnInit() {
    this._subscribers.push(
      this._editorService.hiddenFields$.subscribe(() =>
        this.getTocFields()
      )
    );
    combineLatest([this._route.params, this._route.queryParams]).subscribe(
      ([params, queryParams]) => {
        // uncomment for debug
        // this.form.valueChanges.subscribe(v =>
        //   console.log('model', this.model, 'v', v, 'form', this.form)
        // );
        this._spinner.show();
        this.loadingChange.emit(true);

        this.recordType = params.type;
        this._recordUiService.types = this._route.snapshot.data.types;
        this._resourceConfig = this._recordUiService.getResourceConfig(
          this.recordType
        );
        if (this._resourceConfig.editorLongMode === true) {
          this.longMode = true;
        }
        this.pid = params.pid;

        const schema$: Observable<any> = this._recordService.getSchemaForm(
          this.recordType
        );

        let record$: Observable<any> = of({ record: {}, result: null });
        if (this.pid) {
          record$ = this._recordService
            .getRecord(this.recordType, this.pid)
            .pipe(
              switchMap((record: any) => {
                return this._recordUiService
                  .canUpdateRecord$(record, this.recordType)
                  .pipe(
                    map((result) => {
                      return { result, record: record.metadata };
                    })
                  );
              })
            );
        }

        combineLatest([schema$, record$]).subscribe(([schemaform, data]) => {
          // Set schema
          this.setSchema(schemaform.schema);

          // Check permissions and set record
          if (data.result && data.result.can === false) {
            this._toastrService.error(
              this._translateService.instant('You cannot update this record'),
              this._translateService.instant(this.recordType)
            );
            this._location.back();
          } else {
            this._setModel(data.record);
          }

          // add a small amount of time as the editor needs additionnal time to
          // resolve all async tasks
          setTimeout(() => this._spinner.hide(), 500);
          this.loadingChange.emit(false);
        });
      }
    );
  }

  /**
   * Component destruction
   */
  ngOnDestroy() {
    this._subscribers.forEach(s => s.unsubscribe());
  }

  /**
   * Set the model
   * @param model: The data to use as new model
   */
  private _setModel(model: any): void {
    if (this._resourceConfig != null) {
      // the parent dont know that we are editing a record
      if (this.pid != null && (this.model == null || this.model.pid == null)) {
        model.pid = this.pid;
      }
      // preprocess the model before sending to formly
      this.model = this.preprocessRecord(model);
      this.modelChanged(this.model);
    }
  }

  /**
   * Emit value when model is changed.
   *
   * @param modelValue Model.
   */
  modelChanged(modelValue: any) {
    this.modelChange.emit(modelValue);
  }

  /**
   * Preprocess the record before passing it to the editor
   * @param record - Record object to preprocess
   */
  private preprocessRecord(record: any) {
    const config = this._recordUiService.getResourceConfig(this.recordType);

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
    const config = this._recordUiService.getResourceConfig(this.recordType);

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
    const config = this._recordUiService.getResourceConfig(this.recordType);

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
    const config = this._recordUiService.getResourceConfig(this.recordType);

    if (config.preUpdateRecord) {
      return config.preUpdateRecord(record);
    }
    return record;
  }

  /**
   * Preprocess the record before passing it to the editor
   * @param schema - object, JOSNSchemag
   */
  setSchema(schema: any) {
    // reorder all object properties
    this.schema = orderedJsonSchema(schema);
    this.options = {};

    // form configuration
    const fields = [
      this._formlyJsonschema.toFieldConfig(this.schema, {
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
          if (this.longMode === true) {
            // show the field if the model contains a value usefull for edition
            field.hooks = {
              ...field.hooks,
              onPopulate: (f: any) => {
                this.hideShowEmptyField(f);
              }
            };
          }

          field.templateOptions.longMode = this.longMode;

          if (this._resourceConfig.formFieldMap) {
            return this._resourceConfig.formFieldMap(field, jsonSchema);
          }

          // add a form-field wrapper for boolean (switch)
          if (field.type === 'boolean') {
            field.wrappers = [
              ...(field.wrappers ? field.wrappers : []),
              'form-field'
            ];
          }

          // Add an horizontal wrapper
          if (this.longMode && this._horizontalWrapperTypes.some(elem => elem === field.type)) {
            field.wrappers = [
              ...(field.wrappers ? field.wrappers : []),
              'form-field-horizontal'
            ];
          }
          return field;
        }
      })
    ];
    this.fields = fields;
  }

  /**
   * Hide of show the field depending on the model value.
   * @param field formly field config
   */
  private hideShowEmptyField(field: FormlyFieldConfig) {
    let model = field.model;
    // for simple object the model is the parent dict
    if (
      !['object', 'multischema', 'array'].some(f => f === field.type)
    ) {
      // New from ngx-formly v5.9.0
      model = field.model[Array.isArray(field.key) ? field.key[0] : field.key];
    }
    model = removeEmptyValues(model);
    const modelEmpty = isEmpty(model);
    if (!modelEmpty && (field.hide === true)) {
      setTimeout(() => {
        field.hide = false;
        this._editorService.removeHiddenField(field);
      });
    }
    if (modelEmpty && (field.templateOptions.hide === true && field.hide === undefined)) {
      setTimeout(() => {
        field.hide = true;
        this._editorService.addHiddenField(field);
      });
    }
  }

  /**
   * Save the data on the server.
   * @param event - object, JSON to POST on the backend
   */
  submit(event) {
    this._spinner.show();
    this.loadingChange.emit(true);

    let data = removeEmptyValues(this.model);
    data = this.postprocessRecord(data);

    let recordAction$: Observable<any>;
    let action = 'create';

    if (data.pid != null) {
      action = 'update';
      recordAction$ = this._recordService.update(this.recordType, this.preUpdateRecord(data)).pipe(
        map(record => {
          return { record, action: 'update', message: this._translateService.instant('Record updated.') };
        })
      );
    } else {
      recordAction$ = this._recordService.create(this.recordType, this.preCreateRecord(data)).pipe(
        map(record => {
          return { record, action: 'create', message: this._translateService.instant('Record created.') };
        })
      );
    }

    recordAction$.subscribe(result => {
      this._toastrService.success(
        this._translateService.instant(result.message),
        this._translateService.instant(this.recordType)
      );
      this._recordUiService.redirectAfterSave(
        result.record.metadata.pid,
        result.record,
        this.recordType,
        result.action,
        this._route
      );
      this._spinner.hide();
      this.loadingChange.emit(true);
    });
  }

  /**
   * Scroll the window in to the DOM element corresponding to a given config field.
   * @param event - click DOM event
   * @param field - FormlyFieldConfig, the form config corresponding to the DOM element to jump to.
   */
  setFocus(event: any, field: FormlyFieldConfig) {
    event.preventDefault();
    this._editorService.setFocus(field, true);
  }

  /**
   * Populate the field to add to the TOC
   */
  getTocFields() {
    setTimeout(() => {
      if (this.fields && this.fields.length > 0) {
        this.tocFields = this.fields[0].fieldGroup.filter(f => f.hide !== true);
      }
    });
  }

  /**
   * Cancel editing and back to previous page
   */
  cancel() {
    this._location.back();
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
          const query = formOptions.remoteOptions.query ? formOptions.remoteOptions.query : '';
          f.templateOptions.options = this._recordService
            .getRecords(recordType, query, 1, RecordService.MAX_REST_RESULTS_SIZE)
            .pipe(
              map(data =>
                data.hits.hits.map((record: any) => {
                  return {
                    label: formOptions.remoteOptions.labelField && formOptions.remoteOptions.labelField in record.metadata
                      ? record.metadata[formOptions.remoteOptions.labelField]
                      : record.metadata.name,
                    value: this._apiService.getRefEndpoint(
                      recordType,
                      record.metadata.pid
                    )
                  };
                })
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
          const msg = messages[key];
          // add support of key with or without Message suffix (required == requiredMessage),
          // this is usefull for backend translation extraction
          field.validation.messages[key.replace(/Message$/, '')] = (error, f: FormlyFieldConfig) =>
            // translate the validation messages coming from the JSONSchema
            // TODO: need to remove `as any` once it is fixed in ngx-formly v.5.7.2
            this._translateService.stream(msg) as any;
        }
      }
      // custom validators
      if (formOptions.validation.validators) {
        // asyncValidators: valueAlreadyExists
        if (formOptions.validation.validators.valueAlreadyExists) {
          const remoteRecordType =
            formOptions.validation.validators.valueAlreadyExists.remoteRecordType;
          const limitToValues =
            formOptions.validation.validators.valueAlreadyExists.limitToValues;
          const filter =
            formOptions.validation.validators.valueAlreadyExists.filter;
          const term = formOptions.validation.validators.valueAlreadyExists.term;
          field.asyncValidators = {
            validation: [
              (control: FormControl) => {
                return this._recordService.uniqueValue(
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
          delete formOptions.validation.validators.valueAlreadyExists;
        }
        // asyncValidators: valueKeysInObject
        //  This validator is similar to uniqueValidator but only check on some specific fields of array items.
        if (formOptions.validation.validators.uniqueValueKeysInObject) {
          field.validators = {
            uniqueValueKeysInObject: {
              expression: (control: FormControl) => {
                // if value isn't an array or array contains less than 2 elements, no need to check
                if (!(control.value instanceof Array) || control.value.length < 2) {
                  return true;
                }
                const keysToKeep = formOptions.validation.validators.uniqueValueKeysInObject.keys;
                const uniqueItems = Array.from(
                  new Set(control.value.map((v: any) => {
                    const keys = keysToKeep.reduce((acc, elt) => {
                      acc[elt] = v[elt];
                      return acc;
                    }, {});
                    return JSON.stringify(keys);
                  })),
                );
                return uniqueItems.length === control.value.length;
              }
            }
          };
        }
        // validators: add validator with expressions
        const validatorsKey = Object.keys(formOptions.validation.validators);
        validatorsKey.map(validatorKey => {
          const validator = formOptions.validation.validators[validatorKey];
          if ('expression' in validator && 'message' in validator) {
            const expression = validator.expression;
            const expressionFn = Function('formControl', `return ${expression};`);
            const validatorExpression = {
              expression: (fc: FormControl) => expressionFn(fc),
              // translate the validation message coming form the JSONSchema
              message: this._translateService.stream(validator.message)
            };
            field.validators = field.validators !== undefined ? field.validators : {};
            field.validators[validatorKey] = validatorExpression;
          }
        });
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
    // make selectWithSort field type by default if form options are defined
    if (!formOptions.hasOwnProperty('type') && formOptions.hasOwnProperty('options')) {
      field.type = 'selectWithSort';
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

    // template options
    if (formOptions.templateOptions) {
      field.templateOptions = {
        ...field.templateOptions,
        ...formOptions.templateOptions
      };
    }
  }
}
