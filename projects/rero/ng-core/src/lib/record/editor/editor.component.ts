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
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { TranslateService } from '@ngx-translate/core';
import { JSONSchema7 } from 'json-schema';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { EditorService } from './editor.service';
import { isEmpty, orderedJsonSchema, removeEmptyValues } from './utils';

@Component({
  selector: 'ng-core-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnChanges, OnDestroy {
  // angular formGroup root
  form: FormGroup;

  @Output() modelChange = new EventEmitter<any>();

  @Input() model: any = null;

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
  private _horizontalWrapperTypes = ['enum', 'string', 'remoteautocomplete', 'integer', 'textarea'];

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
    private _location: Location
  ) {
    this.form = new FormGroup({});
  }

  /**
   * Component has changed
   * Called before ngOnInit() and whenever one of the input properties change.
   * @param changes: the changed properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.model) { // Model has changed
      this._setModel(changes.model.currentValue);
    }
  }

  /**
   * Component initialisation
   */
  ngOnInit() {
    combineLatest([this._route.params, this._route.queryParams])
      .subscribe(([params, queryParams]) => {
        // uncomment for debug
        // this.form.valueChanges.subscribe(v =>
        //   console.log('model', this.model, 'v', v, 'form', this.form)
        // );

        this.recordType = params.type;
        this._recordUiService.types = this._route.snapshot.data.types;
        this._resourceConfig = this._recordUiService.getResourceConfig(this.recordType);
        if (this._resourceConfig.editorLongMode === true) {
          this.longMode = true;
          this._subscribers.push(
            this._editorService.hiddenFields$.subscribe(() =>
              this.getTocFields()
            )
          );
        }
        this.pid = params.pid;
        this._recordService
          .getSchemaForm(this.recordType)
          .subscribe(schemaform => {
            this.setSchema(schemaform.schema);
          });
        // edition
        if (this.pid) {
          this._recordService
            .getRecord(this.recordType, this.pid)
            .subscribe(record => {
              this._recordUiService
                .canUpdateRecord$(record, this.recordType)
                .subscribe(result => {
                  if (result.can === false) {
                    this._toastrService.error(
                      this._translateService.instant(
                        'You cannot update this record'
                      ),
                      this._translateService.instant(this.recordType)
                    );
                    this._location.back();
                  } else {
                    this._setModel(record.metadata);
                  }
                });
            });
        } else {
          this._setModel({});
        }
      });
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
      this.modelChange.emit(this.model);
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
   * Process All schema entries to translate oneOf type
   * @param schema - object, JSONSchema
   */
  private translateSchemaAllTitleOneOf(schema: any) {
    const entries = Object.entries(schema.properties);
    for (const entrie of entries) {
      this.translateTitleOneOf(entrie[1]);
    }
    return schema;
  }

  /**
   * Process title on OneOf part
   * @param properties - object, JSONSchema
   */
  private translateTitleOneOf(properties: any) {
    let oneOfValues = null;
    const typeKey = 'type';
    const oneOfKey = 'oneOf';
    const itemKey = 'items';
    switch (properties[typeKey]) {
      case 'object': {
        if (properties.hasOwnProperty(oneOfKey)) {
          oneOfValues = properties[oneOfKey];
        }
        break;
      }
      case 'array': {
        if (
          properties.hasOwnProperty(itemKey)
          && properties[itemKey].hasOwnProperty(oneOfKey)) {
          oneOfValues = properties[itemKey][oneOfKey];
        }
        break;
      }
    }
    if (oneOfValues !== null) {
      oneOfValues.forEach((ofValue: any) => {
        const keyTitle = 'title';
        ofValue[keyTitle] = this._translateService.instant(ofValue[keyTitle]);
      });
      this.translateTitleOneOf(oneOfValues);
    }
  }

  /**
   * Preprocess the record before passing it to the editor
   * @param schema - object, JSONSchema
   */
  setSchema(schema: any) {
    // reorder all object properties
    this.schema = this.translateSchemaAllTitleOneOf(orderedJsonSchema(schema));
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
          if (this._horizontalWrapperTypes.some(elem => elem === field.type)) {
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
      model = field.model[field.key];
    }
    model = removeEmptyValues(model);
    const modelEmpty = isEmpty(model);
    if (!modelEmpty && (field.hide !== false)) {
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
    let data = removeEmptyValues(this.model);
    data = this.postprocessRecord(data);
    if (data.pid != null) {
      this._recordService
        .update(this.recordType, this.preUpdateRecord(data))
        .subscribe(record => {
          this._toastrService.success(
            this._translateService.instant('Record Updated!'),
            this._translateService.instant(this.recordType)
          );
          this._recordUiService.redirectAfterSave(
            this.pid,
            record,
            this.recordType,
            'update',
            this._route
          );
        });
    } else {
      this._recordService
        .create(this.recordType, this.preCreateRecord(data))
        .subscribe(record => {
          this._toastrService.success(
            this._translateService.instant('Resource created'),
            this._translateService.instant(this.recordType)
          );
          this._recordUiService.redirectAfterSave(
            record.metadata.pid,
            record,
            this.recordType,
            'create',
            this._route
          );
        });
    }
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
      field.templateOptions.options = formOptions.options
      .map((option: { label: string, value: string }) => {
        return {
          label: this._translateService.instant(option.label),
          value: option.value
        };
      });
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
