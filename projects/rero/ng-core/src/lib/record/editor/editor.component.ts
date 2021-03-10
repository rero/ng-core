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
import { JSONSchema7 as JSONSchema7Base } from 'json-schema';
import { cloneDeep } from 'lodash-es';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import { Error } from '../../error/error';
import { RouteCollectionService } from '../../route/route-collection.service';
import { Record } from '../record';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { EditorService } from './services/editor.service';
import { orderedJsonSchema, removeEmptyValues } from './utils';
import { LoadTemplateFormComponent } from './widgets/load-template-form/load-template-form.component';
import { SaveTemplateFormComponent } from './widgets/save-template-form/save-template-form.component';

export interface JSONSchema7 extends JSONSchema7Base {
  form: any;
}

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

  // root element of the editor
  rootFomlyConfig: FormlyFieldConfig;

  // list of fields to display in the TOC
  tocFields$: Observable<any>;

  // JSONSchema
  @Input() schema: any;

  // editor settings
  @Input()
  editorSettings = {
    longMode: false,  // editor long mode
    template: {
      recordType: undefined,    // the resource considerate as template
      loadFromTemplate: false,  // enable load from template button
      saveAsTemplate: false     // allow to save the record as a template
    }
  };

  // save alternatives
  saveAlternatives: { label: string, action: any }[] = [];

  // current record type from the url
  recordType = null;

  // store pid on edit mode
  pid = null;

  // If an error occurred, it is stored, to display in interface.
  error: Error;

  // subscribers
  private _subscribers: Subscription[] = [];

  // Config for resource
  private _resourceConfig: any;

  // list of custom validators
  private _customValidators = [
    'valueAlreadyExists',
    'uniqueValueKeysInObject',
    'dateMustBeGreaterThan',
    'dateMustBeLessThan'
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
   * @param _modalService BsModalService.
   * @param _routeCollectionService RouteCollectionService
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
    private _spinner: NgxSpinnerService,
    private _modalService: BsModalService,
    private _routeCollectionService: RouteCollectionService
  ) {
    this.form = new FormGroup({});
  }

  /**
   * Component has changed
   * Called before ngOnInit() and whenever one of the input properties change.
   * @param changes: the changed properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.model && !changes.model.isFirstChange()) { // Model has changed
      this._setModel(changes.model.currentValue);
      // needed to select the right value for existing data in the multi select
      // components such as oneOf
      if (this.schema) {
        this.setSchema(this.schema);
      }
    }
    if (changes.schema && changes.schema.isFirstChange()) { // Schema has changed
      this.setSchema(changes.schema.currentValue);
    }
  }

  /**
   * Component initialisation
   */
  ngOnInit() {
    this.tocFields$ = this._editorService.hiddenFields$.pipe(
      debounceTime(300),
      switchMap(() => {
        if (this.fields && this.fields.length > 0) {
          return of(
            this.fields[0].fieldGroup.filter(f => {
              // hidden properties should not be in the navigation
              if (f.hide === true) {
                return false;
              }
              // properties with hide wrapper should not be in the navigation
              if (f.wrappers && f.wrappers.some(w => w === 'hide')) {
                return false;
              }
              return true;
            }));
        }
        return of([]);
      })
    );
    combineLatest([this._route.params, this._route.queryParams]).subscribe(
      ([params, queryParams]) => {
        // uncomment for debug
        // this.form.valueChanges.subscribe(v =>
        //   console.log('model', this.model, 'v', v, 'form', this.form)
        // );
        this._spinner.show();
        this.loadingChange.emit(true);
        if (!params.type) {
          this.model = {};
          this.schema = {};
          this._spinner.hide();
          return;
        }
        this.recordType = params.type;
        this._recordUiService.types = this._route.snapshot.data.types;

        this._resourceConfig = this._recordUiService.getResourceConfig(
          this.recordType
        );
        if (this._resourceConfig.editorSettings) {
          this.editorSettings = { ...cloneDeep(this.editorSettings), ...this._resourceConfig.editorSettings };
        }

        // load template resource configuration if needed
        //   If editor allowed to use a resource as a template, we need to load the configuration
        //   of this resource and save it into `recordUIService.types` to use it when loading and saving
        if (this.editorSettings.template.recordType !== undefined) {
          const tmplResource = this._routeCollectionService.getRoute(this.editorSettings.template.recordType);
          const tmplConfiguration = tmplResource.getConfiguration();
          if (tmplConfiguration.hasOwnProperty('data')
            && tmplConfiguration.data.hasOwnProperty('types')) {
            this._recordUiService.types = this._recordUiService.types.concat(tmplConfiguration.data.types);
          }
        }

        // saveAlternatives construction
        //   Depending of editor configuration, it's possible to provide some alternatives save
        //   methods. Each method must defined a label and a callback function used when user choose
        //   this save method.
        this.saveAlternatives = [];
        if (this.editorSettings.template.saveAsTemplate) {
          this.saveAlternatives.push({
            label: this._translateService.instant('Save as template') + '…',
            action: this._saveAsTemplate
          });
        }

        this.pid = params.pid;
        const schema$: Observable<any> = this._recordService.getSchemaForm(this.recordType);
        let record$: Observable<any> = of({ record: {}, result: null });
        // load from template
        //   If the url contains query arguments 'source' and 'pid' and 'source'=='templates'
        //   then we need to use the data from this template as data source to fill the form.
        if (queryParams.source === 'templates' && queryParams.pid != null) {
          record$ = this._recordService.getRecord('templates', queryParams.pid).pipe(
            map((record: any) => {
              this._toastrService.success(
                this._translateService.instant('Template loaded')
              );
              return {
                result: true,
                record: record.metadata.data
              };
            })
          );
          // load data from existing document
          //   If the parsed url contains a 'pid' value, then user try to edit a record. Then
          //   we need to load this record and use it as data source to fill the form.
        } else if (this.pid) {
          record$ = this._recordService
            .getRecord(this.recordType, this.pid)
            .pipe(
              switchMap((record: any) => {
                return this._recordUiService.canUpdateRecord$(record, this.recordType).pipe(
                  map((result) => {
                    return {
                      result,
                      record: record.metadata
                    };
                  })
                );
              })
            );
        }

        combineLatest([schema$, record$]).subscribe(
          ([schemaform, data]) => {
            // Set schema
            this.setSchema(
              this._resourceConfig.recordResource
                ? schemaform.schema.properties.metadata
                : schemaform.schema
            );

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
          },
          (error) => {
            this.error = error;
            this._spinner.hide();
            this.loadingChange.emit(false);
          }
        );
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

      // /!\ This will probably not work anymore with resources managed by
      // invenio-records-resources, a fix will be necessary to make it work
      // with both systems.
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
    this.modelChange.emit(removeEmptyValues(modelValue));
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
    // remove hidden field list in case of a previous setSchema call
    this._editorService.clearHiddenFields();

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
          field.templateOptions.longMode = this.editorSettings.longMode;
          field.templateOptions.recordType = this.recordType;
          field.templateOptions.pid = this.pid;

          if (formOptions) {
            this._setSimpleOptions(field, formOptions);
            this._setValidation(field, formOptions);
            this._setRemoteSelectOptions(field, formOptions);
            this._setRemoteTypeahead(field, formOptions);
          }


          if (this._resourceConfig != null && this._resourceConfig.formFieldMap) {
            return this._resourceConfig.formFieldMap(field, jsonSchema);
          }

          return field;
        }
      })
    ];
    // mark the root field
    fields[0].templateOptions.isRoot = true;
    this.fields = fields;
    // set root element
    if (this.fields) {
      this.rootFomlyConfig = this.fields[0];
    }
  }

  /**
   * Save the data on the server.
   */
  submit() {
    this.form.updateValueAndValidity();

    if (this.form.valid === false) {
      this._toastrService.error(
        this._translateService.instant('The form contains errors.')
      );
      return;
    }

    this._spinner.show();
    this.loadingChange.emit(true);

    let data = removeEmptyValues(this.model);
    data = this.postprocessRecord(data);

    // For compatibility with resources managed with invenio-records-resources
    if (this._resourceConfig.recordResource) {
      data = { metadata: data };
    }

    let recordAction$: Observable<any>;
    if (this.pid != null) {
      recordAction$ = this._recordService.update(this.recordType, this.pid, this.preUpdateRecord(data)).pipe(
        catchError((error) => this._handleError(error)),
        map(record => {
          return { record, action: 'update', message: this._translateService.instant('Record updated.') };
        })
      );
    } else {
      recordAction$ = this._recordService.create(this.recordType, this.preCreateRecord(data)).pipe(
        catchError((error) => this._handleError(error)),
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
        result.record.id,
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
   *  Save the current editor content as a template
   *  @param entry: the entry to use to fire this function
   *  @param component: the parent editor component
   */
  _saveAsTemplate(entry, component: EditorComponent) {
    // NOTE about `component` param :
    //   As we use `_saveAsTemplate` in a ngFor loop, the common `this` value equals to the current
    //   loop value, not the current component. We need to pass this component as parameter of
    //   the function to use it.
    const saveAsTemplateModalRef = component._modalService.show(SaveTemplateFormComponent, {
      ignoreBackdropClick: true,
    });
    // if the modal is closed by clicking the 'save' button, the `saveEvent` is fired.
    // Subscribe to this event know when creating a model
    component._subscribers.push(saveAsTemplateModalRef.content.saveEvent.subscribe(
      (data) => {
        component._spinner.show();
        let modelData = removeEmptyValues(component.model);
        modelData = component.postprocessRecord(modelData);

        let record = {
          name: data.name,
          data: modelData,
          template_type: component.recordType,
        };
        const tmplConfig = component._recordUiService.getResourceConfig(component.editorSettings.template.recordType);
        if (tmplConfig.preCreateRecord) {
          record = tmplConfig.preCreateRecord(record);
        }

        // create template
        component._recordService.create(component.editorSettings.template.recordType, record).subscribe(
          (createdRecord) => {
            component._toastrService.success(
              component._translateService.instant('Record created.'),
              component._translateService.instant(component.editorSettings.template.recordType)
            );
            component._recordUiService.redirectAfterSave(
              createdRecord.id,
              createdRecord,
              component.editorSettings.template.recordType,
              'create',
              component._route
            );
          }
        );
        component._spinner.hide();
        component.loadingChange.emit(true);
      }
    ));
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
   * Cancel editing and back to previous page
   */
  cancel() {
    this._location.back();
  }

  /**
   * Open a modal dialog box to load a template.
   */
  showLoadTemplateDialog() {
    const templateResourceType = this.editorSettings.template.recordType;
    this._modalService.show(LoadTemplateFormComponent, {
      ignoreBackdropClick: true,
      initialState: {
        templateResourceType,
        resourceType: this.recordType
      }
    });
  }

  /**
   * Can the `load template` should be visible.
   * The 'load template' button will be visible only if the corresponding setting is set and the user
   * isn't in 'edit mode' (load template is only available for new resources)
   * @return True if the button could be visible ; False otherwise
   */
  canLoadTemplate() {
    return this.editorSettings.template.loadFromTemplate && !this.pid;
  }

  /********************* Private  ***************************************/

  /**
   * Populate a select options with a remote API call.
   * @param field formly field config
   * @param formOptions JSONSchema object
   */
  private _setRemoteSelectOptions(
    field: FormlyFieldConfig,
    formOptions: any
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
              map((data: Record) =>
                data.hits.hits.map((record: any) => {
                  return {
                    label: formOptions.remoteOptions.labelField && formOptions.remoteOptions.labelField in record.metadata
                      ? record.metadata[formOptions.remoteOptions.labelField]
                      : record.metadata.name,
                    value: this._apiService.getRefEndpoint(
                      recordType,
                      record.id
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
   * Store the remote typeahead options.
   * @param field formly field config
   * @param formOptions JSONSchema object
   */
  private _setRemoteTypeahead(
    field: FormlyFieldConfig,
    formOptions: any
  ) {
    if (formOptions.remoteTypeahead && formOptions.remoteTypeahead.type) {
      field.type = 'remoteTypeahead';
      field.templateOptions = {
        ...field.templateOptions,
        ...{ remoteTypeahead: formOptions.remoteTypeahead }
      };
    }
  }

  /**
   *
   * @param field formly field config
   * @param formOptions JSONSchema object
   */
  private _setValidation(field: FormlyFieldConfig, formOptions: any) {
    if (formOptions.validation) {
      // custom validation messages
      // TODO: use widget instead
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

      // store the custom validators config
      field.templateOptions.customValidators = {};
      if (formOptions.validation && formOptions.validation.validators) {
        for (const customValidator of this._customValidators) {
          const validatorConfig = formOptions.validation.validators[customValidator];
          if (validatorConfig != null) {
            field.templateOptions.customValidators[customValidator] = validatorConfig;
          }
        }
      }

      if (formOptions.validation.validators) {
        // validators: add validator with expressions
        // TODO: use widget
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
  private _setSimpleOptions(field: FormlyFieldConfig, formOptions: any) {
    // ngx formly standard options
    // hide a field at startup
    if (formOptions.hide === true) {
      field.templateOptions.hide = true;
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

  /**
   * Handle form error
   * @param object with status and title parameters
   * @return Observable<Error>
   */
  private _handleError(error: { status: number, title: string }): Observable<Error> {
    this._spinner.hide();
    this.form.setErrors({ formError: true });
    return throwError({ status: error.status, title: error.title });
  }
}
