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
import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { TranslateService } from '@ngx-translate/core';
import { JSONSchema7 as JSONSchema7Base } from 'json-schema';
import { cloneDeep } from 'lodash-es';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subscription, combineLatest, of, throwError } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import { AbstractCanDeactivateComponent } from '../../component/abstract-can-deactivate.component';
import { Error } from '../../error/error';
import { RouteCollectionService } from '../../route/route-collection.service';
import { LoggerService } from '../../service/logger.service';
import { Record } from '../record';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { processJsonSchema, removeEmptyValues, resolve$ref } from './utils';
import { LoadTemplateFormComponent } from './widgets/load-template-form/load-template-form.component';
import { SaveTemplateFormComponent } from './widgets/save-template-form/save-template-form.component';

export interface JSONSchema7 extends JSONSchema7Base {
  widget: any;
}

@Component({
  selector: 'ng-core-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  // make the style global: required by JSONSchema cssClass
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent extends AbstractCanDeactivateComponent implements OnInit, OnChanges, OnDestroy {

  // form initial values
  @Input() model: any = null;

  // initial values changes notification
  @Output() modelChange = new EventEmitter<any>();

  // editor loading state notifications
  @Output() loadingChange = new EventEmitter<boolean>();

  // editor can deactivate change notification
  @Output() canDeactivateChange = new EventEmitter<boolean>();

  // Resource title
  title?: string;

  // Resource description
  description?: string;

  // Can Deactivate
  canDeactivate: boolean = false;

  // angular formGroup root
  form: UntypedFormGroup;

  // additional form options
  options: FormlyFormOptions;

  // form configuration
  fields: FormlyFieldConfig[];

  // root element of the editor
  rootFormlyConfig: FormlyFieldConfig;

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

  // store pid on edit mode
  @Input() pid = null;

  // save alternatives
  saveAlternatives: { label: string, action: any }[] = [];

  // current record type from the url
  recordType = null;

  // If an error occurred, it is stored, to display in interface.
  error: Error;

  /** Disables the save button during the action */
  isSaveButtonDisabled = false;

  // subscribers
  private _subscribers: Subscription = new Subscription();

  // Config for resource
  private _resourceConfig: any;

  // list of custom validators
  private _customValidators = [
    'valueAlreadyExists',
    'uniqueValueKeysInObject',
    'numberOfSpecificValuesInObject',
    'dateMustBeGreaterThan',
    'dateMustBeLessThan'
  ];

  // list of fields to be hidden
  private _hiddenFields: FormlyFieldConfig[] = [];

  // Observable of hidden fields
  private _hiddenFieldsSubject: BehaviorSubject<FormlyFieldConfig[]> = new BehaviorSubject([]);

  // Previous Url for navigation
  private previousUrl?: string = undefined;

  // current list of hidden fields
  public get hiddenFields$(): Observable<any[]> {
    return this._hiddenFieldsSubject.asObservable();
  }

  // Editor long mode
  public get longMode(): boolean {
    return this.editorSettings.longMode;
  }

  // Editor edit mode
  public get editMode(): boolean {
    return this.pid ? true : false;
  }

  // Editor root field
  public get rootField(): FormlyFieldConfig {
    return this.rootFormlyConfig;
  }

  // Editor function
  public get editorComponent(): () => EditorComponent {
    return () => this;
  }

  /**
   * Constructor.
   * @param formlyJsonschema Formly JSON schema.
   * @param recordService Record service.
   * @param apiService API service.
   * @param route Route.
   * @param recordUiService Record UI service.
   * @param translateService Translate service.
   * @param toastrService Toast service.
   * @param location Location.
   * @param modalService BsModalService.
   * @param routeCollectionService RouteCollectionService
   * @param loggerService LoggerService
   * @param router Router
   */
  constructor(
    protected formlyJsonschema: FormlyJsonschema,
    protected recordService: RecordService,
    protected apiService: ApiService,
    protected route: ActivatedRoute,
    protected recordUiService: RecordUiService,
    protected translateService: TranslateService,
    protected toastrService: ToastrService,
    protected location: Location,
    protected modalService: BsModalService,
    protected routeCollectionService: RouteCollectionService,
    protected loggerService: LoggerService,
    protected router: Router
  ) {
    super();
    this.form = new UntypedFormGroup({});
    this.previousUrl = this.router.getCurrentNavigation()?.previousNavigation?.extractedUrl?.toString();
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
    if (changes.pid) { // Assign pid on schema. Reload schema
      this.pid = changes.pid.currentValue;
      if (this.schema) {
        this.setSchema(this.schema);
      }
    }
  }

  /** onInit hook */
  ngOnInit(): void {
    this.tocFields$ = this.hiddenFields$.pipe(
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
    combineLatest([this.route.params, this.route.queryParams]).subscribe(
      ([params, queryParams]) => {
        // uncomment for debug
        // this.form.valueChanges.subscribe(v =>
        //   console.log('model', this.model, 'v', v, 'form', this.form, 'field', this.fields)
        // );
        this.loadingChange.emit(true);
        if (!params.type) {
          this.model = {};
          this.schema = {};
          return;
        }
        this.recordType = params.type;
        this.recordUiService.types = this.route.snapshot.data.types;

        this._resourceConfig = this.recordUiService.getResourceConfig(
          this.recordType
        );
        if (this._resourceConfig.editorSettings) {
          this.editorSettings = { ...cloneDeep(this.editorSettings), ...this._resourceConfig.editorSettings };
        }

        // load template resource configuration if needed
        //   If editor allowed to use a resource as a template, we need to load the configuration
        //   of this resource and save it into `recordUIService.types` to use it when loading and saving
        if (this.editorSettings.template.recordType !== undefined) {
          const tmplResource = this.routeCollectionService.getRoute(this.editorSettings.template.recordType);
          const tmplConfiguration = tmplResource.getConfiguration();
          if (tmplConfiguration.hasOwnProperty('data')
            && tmplConfiguration.data.hasOwnProperty('types')) {
            this.recordUiService.types = this.recordUiService.types.concat(tmplConfiguration.data.types);
          }
        }

        // saveAlternatives construction
        //   Depending of editor configuration, it's possible to provide some alternatives save
        //   methods. Each method must defined a label and a callback function used when user choose
        //   this save method.
        this.saveAlternatives = [];
        if (this.editorSettings.template.saveAsTemplate) {
          this.saveAlternatives.push({
            label: this.translateService.instant('Save as template') + '…',
            action: this._saveAsTemplate
          });
        }

        this.pid = params.pid;
        const schema$: Observable<any> = this.recordService.getSchemaForm(this.recordType);
        let record$: Observable<any> = of({ record: {}, result: null });
        // load from template
        //   If the url contains query arguments 'source' and 'pid' and 'source'=='templates'
        //   then we need to use the data from this template as data source to fill the form.
        if (queryParams.source === 'templates' && queryParams.pid != null) {
          record$ = this.recordService.getRecord('templates', queryParams.pid).pipe(
            map((record: any) => {
              this.toastrService.success(
                this.translateService.instant('Template loaded')
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
          record$ = this.recordService
            .getRecord(this.recordType, this.pid)
            .pipe(
              switchMap((record: any) => {
                return this.recordUiService.canUpdateRecord$(record, this.recordType).pipe(
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
              this.toastrService.error(
                this.translateService.instant('You cannot update this record'),
                this.translateService.instant(this.recordType)
              );
              this.location.back();
            } else {
              this._setModel(data.record);
            }

            this.loadingChange.emit(false);
          },
          (error) => {
            this.error = error;
            this.loadingChange.emit(false);
          }
        );
      }
    );
  }

  /** onDestroy hook */
  ngOnDestroy(): void {
    this._subscribers.unsubscribe();
  }

  /**
   * Set the model
   * @param model: The data to use as new model
   */
  private _setModel(model: any): void {
    if (this._resourceConfig != null) {
      // the parent don't know that we are editing a record

      // /!\ This will probably not work anymore with resources managed by
      // invenio-records-resources, a fix will be necessary to make it work
      // with both systems.
      if (
        !this._resourceConfig.recordResource &&
        this.pid != null &&
        (this.model == null || this.model.pid == null)
      ) {
        model.pid = this.pid;
      }
      // preprocess the model before sending to formly
      this.model = this.preprocessRecord(model);
      this.modelChanged(this.model);
    }
  }

  /**
   * Emit value when model is changed.
   * @param modelValue Model.
   */
  modelChanged(modelValue: any): void {
    this.modelChange.emit(removeEmptyValues(modelValue));
  }

  /**
   * Preprocess the record before passing it to the editor
   * @param record - Record object to preprocess
   */
  private preprocessRecord(record: any): any {
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
  private postprocessRecord(record: any): any {
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
  private preCreateRecord(record: any): any {
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
  private preUpdateRecord(record: any): any {
    const config = this.recordUiService.getResourceConfig(this.recordType);

    if (config.preUpdateRecord) {
      return config.preUpdateRecord(record);
    }
    return record;
  }

  /**
   * Preprocess the record before passing it to the editor
   * @param schema - object, JSONSchema
   */
  setSchema(schema: any): void {
    // reorder all object properties
    this.schema = processJsonSchema(resolve$ref(schema, schema.properties));
    this.options = {};

    // remove hidden field list in case of a previous setSchema call
    this.clearHiddenFields();

    // form configuration
    const fields = [
      this.formlyJsonschema.toFieldConfig(this.schema, {
        // post process JSONSChema7 to FormlyFieldConfig conversion
        map: (field: FormlyFieldConfig, jsonSchema: JSONSchema7) => {
          /**** additional JSONSchema configurations *******/

          // initial population of arrays with a minItems constraints
          if (jsonSchema.minItems && !jsonSchema.hasOwnProperty('default')) {
            field.defaultValue = new Array(jsonSchema.minItems);
          }
          // If 'format' is defined into the jsonSchema, use it as props to try a validation on this field.
          // See: `email.validator.ts` file
          if (jsonSchema.format) {
            field.props.type = jsonSchema.format;
          }

          if (jsonSchema?.widget?.formlyConfig) {
            const { props } = jsonSchema.widget.formlyConfig;

            if (props) {
              this._setSimpleOptions(field, props);
              this._setValidation(field, props);
              this._setRemoteSelectOptions(field, props);
              this._setRemoteTypeahead(field, props);
            }
          }
          // Add editor component function on the field
          field.props.editorComponent = this.editorComponent;

          if (this._resourceConfig != null && this._resourceConfig.formFieldMap) {
            return this._resourceConfig.formFieldMap(field, jsonSchema);
          }

          return field;
        }
      })
    ];
    // mark the root field
    fields[0].props.isRoot = true;

    this.fields = fields;

    // set root element
    if (this.fields) {
      this.title = this.fields[0].props?.label;
      this.description = this.fields[0].props?.description;
      this.rootFormlyConfig = this.fields[0];
    }
  }

  /**
   * Save the data on the server.
   */
  submit(): void {
    this.isSaveButtonDisabled = true;
    this._canDeactivate();
    this.form.updateValueAndValidity();

    if (this.form.valid === false) {
      const fields = [];
      Object.keys(this.form.controls).forEach((key: string) => {
        if (this.form.controls[key].status !== 'VALID') {
          fields.push(this.translateService.instant(key));
        }
      });
      let errorMessage = '';
      if (fields.length > 0) {
        errorMessage += '<br>' + this.translateService.instant('Field(s) in error: ');
        errorMessage += fields.join(', ');
      }
      this.toastrService.error(
        this.translateService.instant('The form contains errors.') + errorMessage,
        undefined,
        {enableHtml: true}
      );
      this.isSaveButtonDisabled = false;
      return;
    }

    this.loadingChange.emit(true);

    let data = removeEmptyValues(this.model);
    data = this.postprocessRecord(data);

    // For compatibility with resources managed with invenio-records-resources
    if (this._resourceConfig.recordResource) {
      data = { metadata: data };
    }

    // The record has validation, the action `save` is set.
    if (data.metadata?.validation) {
      data.metadata.validation.action = 'save';
    }

    let recordAction$: Observable<any>;
    if (this.pid != null) {
      recordAction$ = this.recordService.update(this.recordType, this.pid, this.preUpdateRecord(data)).pipe(
        catchError((error) => this._handleError(error)),
        map(record => {
          return { record, action: 'update', message: this.translateService.instant('Record updated.') };
        }),
        finalize(() => this.isSaveButtonDisabled = false)
      );
    } else {
      recordAction$ = this.recordService.create(this.recordType, this.preCreateRecord(data)).pipe(
        catchError((error) => this._handleError(error)),
        map(record => {
          return { record, action: 'create', message: this.translateService.instant('Record created.') };
        }),
        finalize(() => this.isSaveButtonDisabled = false)
      );
    }

    recordAction$.subscribe(result => {
      this.toastrService.success(
        this.translateService.instant(result.message),
        this.translateService.instant(this.recordType)
      );
      if (this.previousUrl) {
        this.router.navigateByUrl(this.previousUrl, { replaceUrl: true });
      } else {
        this.recordUiService.redirectAfterSave(
          result.record.id,
          result.record,
          this.recordType,
          result.action,
          this.route
        );
      }
      this.loadingChange.emit(true);
    });
  }

  /**
   *  Save the current editor content as a template
   *  @param entry: the entry to use to fire this function
   *  @param component: the parent editor component
   */
  _saveAsTemplate(_entry: any, component: EditorComponent): void {
    // NOTE about `component` param :
    //   As we use `_saveAsTemplate` in a @for loop, the common `this` value equals to the current
    //   loop value, not the current component. We need to pass this component as parameter of
    //   the function to use it.
    const saveAsTemplateModalRef = component.modalService.show(SaveTemplateFormComponent, {
      ignoreBackdropClick: true,
    });
    // if the modal is closed by clicking the 'save' button, the `saveEvent` is fired.
    // Subscribe to this event know when creating a model
    component._subscribers.add(saveAsTemplateModalRef.content.saveEvent.subscribe(
      (data) => {
        let modelData = removeEmptyValues(component.model);
        modelData = component.postprocessRecord(modelData);

        let record = {
          name: data.name,
          data: modelData,
          template_type: component.recordType,
        };
        const tmplConfig = component.recordUiService.getResourceConfig(component.editorSettings.template.recordType);
        if (tmplConfig.preCreateRecord) {
          record = tmplConfig.preCreateRecord(record);
        }

        // create template
        component.recordService.create(component.editorSettings.template.recordType, record).subscribe(
          (createdRecord) => {
            component.toastrService.success(
              component.translateService.instant('Record created.'),
              component.translateService.instant(component.editorSettings.template.recordType)
            );
            component.recordUiService.redirectAfterSave(
              createdRecord.id,
              createdRecord,
              component.editorSettings.template.recordType,
              'create',
              component.route
            );
          }
        );
        component.loadingChange.emit(true);
      }
    ));
  }


  /**
   * Scroll the window in to the DOM element corresponding to a given config field.
   * @param event - click DOM event
   * @param field - FormlyFieldConfig, the form config corresponding to the DOM element to jump to.
   */
  setFocus(event: any, field: FormlyFieldConfig): void {
    event.preventDefault();
    this.setFieldFocus(field, true);
  }

  /**
   * Cancel editing and back to previous page
   */
  cancel(): void {
    this._canDeactivate();
    this.location.back();
  }

  /**
   * Open a modal dialog box to load a template.
   */
  showLoadTemplateDialog(): void {
    const templateResourceType = this.editorSettings.template.recordType;
    this.modalService.show(LoadTemplateFormComponent, {
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
  canLoadTemplate(): boolean {
    return this.editorSettings.template.loadFromTemplate && !this.pid;
  }

  /********** Form field manipulation **********/

  /**
   * Scroll to a field or fieldGroup and set focus in the first field candidate.
   * @param field: the field or fieldGroup where to search about field candidate.
   * @param scroll: is the screen should scroll to the field.
   */
  setFieldFocus(field: FormlyFieldConfig, scroll: boolean = false): boolean {
    if (scroll === true && field.id)  {
      const el = document.getElementById(`field-${field.id}`);
      if (el != null) {
        // we need to scroll after the focus setTimeout push the action in the
        // next event loop.
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }));
        scroll = false;
      }
    }
    if (field.fieldGroup && field.fieldGroup.length > 0) {
      const visibleFields = field.fieldGroup.filter(f => !f.hide);
      if (visibleFields.length > 0) {
        return this.setFieldFocus(visibleFields[0], scroll);
      }
    }
    field.focus = true;
    return true;
  }

  /**
   * Add a field to the hidden list
   * @param field - FormlyFieldConfig, form config to be added
   */
  addHiddenField(field: FormlyFieldConfig): void {
    if (this.isRoot(field.parent)) {
      // formly can change the reference of a field. Especially when the model
      // change such as external import.
      this._hiddenFields = this._hiddenFields.filter(f => f.id !== field.id);
      this._hiddenFields.push(field);
      this._hiddenFieldsSubject.next(this._hiddenFields);
    }
  }

  /**
   * Clear the list of the hidden fields
   */
  clearHiddenFields(): void {
    this._hiddenFields = [];
    this._hiddenFieldsSubject.next(this._hiddenFields);
  }

  /**
   * Remove a field to the hidden list
   * @param field - FormlyFieldConfig, form config to be removed
   */
  removeHiddenField(field: FormlyFieldConfig): void {
    if (this._hiddenFields.some(f => f.id === field.id) && this.isRoot(field.parent)) {
      // Form is touched if a field is added.
      // Required for hide field in edit mode.
      this.rootField.formControl.markAsTouched();
      this._hiddenFields = this._hiddenFields.filter(f => f.id !== field.id);
      this._hiddenFieldsSubject.next(this._hiddenFields);
    }
  }

  /**
   * Am I at the root of the form?
   * @param field - FormlyFieldConfig, the field to hide
   * @returns boolean, true if I'm the root
   */
  isRoot(field: FormlyFieldConfig): boolean {
    if (field == null) {
      return false;
    }
    return field.props?.isRoot || false;
  }

  /**
   * Can the field be hidden?
   * @param field - FormlyFieldConfig, the field to hide
   * @returns boolean, true if the field can be hidden
   */
  canHide(field: FormlyFieldConfig): boolean {
    if (!this.longMode) {
      return false;
    }
    return (
      !field.props.required &&
      !field.hide &&
      !('hide' in field?.expressions)
    );
  }

  /**
   * Hide the given formly field.
   * @param field - FormlyFieldConfig, the field to hide
   */
  hide(field: FormlyFieldConfig): void {
    field.hide = true;
    if (this.isRoot(field.parent)) {
      this.addHiddenField(field);
    }
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
  ): void {
    if (formOptions.remoteOptions && formOptions.remoteOptions.type) {
      field.type = 'select';
      field.hooks = {
        ...field.hooks,
        afterContentInit: (f: FormlyFieldConfig) => {
          const recordType = formOptions.remoteOptions.type;
          const query = formOptions.remoteOptions.query || '';
          f.props.options = this.recordService
            .getRecords(recordType, query, 1, RecordService.MAX_REST_RESULTS_SIZE)
            .pipe(
              map((data: Record) =>
                data.hits.hits.map((record: any) => {
                  return {
                    label: formOptions.remoteOptions.labelField && formOptions.remoteOptions.labelField in record.metadata
                      ? record.metadata[formOptions.remoteOptions.labelField]
                      : record.metadata.name,
                    value: this.apiService.getRefEndpoint(
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
  ): void {
    if (formOptions.remoteTypeahead && formOptions.remoteTypeahead.type) {
      field.type = 'remoteTypeahead';
      field.props = {
        ...field.props,
        ...{ remoteTypeahead: formOptions.remoteTypeahead }
      };
    }
  }

  /**
   *
   * @param field formly field config
   * @param formOptions JSONSchema object
   */
  private _setValidation(field: FormlyFieldConfig, formOptions: any): void {
    if (formOptions.validation) {
      // custom validation messages
      // TODO: use widget instead
      const { messages } = formOptions.validation;
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
          // this is useful for backend translation extraction
          field.validation.messages[key.replace(/Message$/, '')] = (error, f: FormlyFieldConfig) =>
            // translate the validation messages coming from the JSONSchema
            // TODO: need to remove `as any` once it is fixed in ngx-formly v.5.7.2
            this.translateService.stream(msg) as any;
        }
      }

      // store the custom validators config
      field.props.customValidators = {};
      if (formOptions.validation && formOptions.validation.validators) {
        for (const customValidator of this._customValidators) {
          const validatorConfig = formOptions.validation.validators[customValidator];
          if (validatorConfig != null) {
            field.props.customValidators[customValidator] = validatorConfig;
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
            const { expression } = validator;
            const expressionFn = Function('formControl', `return ${expression};`);
            const validatorExpression = {
              expression: (fc: UntypedFormControl) => expressionFn(fc),
              // translate the validation message coming form the JSONSchema
              message: this.translateService.stream(validator.message)
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
  private _setSimpleOptions(field: FormlyFieldConfig, formOptions: any): void {
    // some fields should not submit the form when enter key is pressed
    if (field.props.doNotSubmitOnEnter != null) {
      field.props.keydown = (f: FormlyFieldConfig, event?: any) => {
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      };
    }
  }

  /**
   * Handle form error
   * @param error: object with status and title parameters
   * @return Observable<Error>
   */
  private _handleError(error: { status: number, title: string }): Observable<Error> {
    this.form.setErrors({ formError: error });
    return throwError({ status: error.status, title: error.title });
  }

  private _canDeactivate(activate: boolean = true) {
    this.canDeactivate = activate;
    this.canDeactivateChange.next(activate);
  }
}
