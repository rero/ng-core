/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SplitButton } from 'primeng/splitbutton';
import { Tooltip } from 'primeng/tooltip';
import { combineLatest, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { UpperCaseFirstPipe } from '../../../../core';
import { AbstractCanDeactivateComponent } from '../../../../core/component/abstract-can-deactivate/abstract-can-deactivate.component';
import { ErrorComponent } from '../../../../core/component/error/error.component';
import { Error } from '../../../../core/component/error/error.interface';
import { CONFIG } from '../../../../core/config/config';
import { RouteCollectionService } from '../../../../core/service/route/route-collection.service';
import { AddFieldEditorComponent } from '../../../../formly';
import { ActionStatus, JsonObject, JsonValue, RecordData } from '../../../../model';
import { ApiService } from '../../../service/api/api.service';
import { RecordUiService } from '../../../service/record-ui/record-ui.service';
import { RecordService } from '../../../service/record/record.service';
import { JSONSchemaService } from '../../services/jsonschema/jsonschema.service';
import { TemplateMetadata } from '../../services/template/templates.service';
import { JSONSchema7, processJsonSchema, removeEmptyValues, resolve$ref } from '../../utils/utils';
import { LoadTemplateFormComponent } from '../load-template-form/load-template-form.component';
import { SaveTemplateFormComponent } from '../save-template-form/save-template-form.component';

interface EditorTemplateSettings {
  recordType: string;
  loadFromTemplate: boolean;
  saveAsTemplate: boolean;
}

interface EditorSettingsConfig {
  longMode?: boolean;
  getHeaders?: unknown;
  template?: Partial<EditorTemplateSettings>;
}

interface EditorResourceConfig {
  recordResource?: boolean;
  editorSettings?: EditorSettingsConfig;
}

type ResourceConfigType = ReturnType<RecordUiService['getResourceConfig']> & EditorResourceConfig;

interface EditorRouteParams {
  type?: string;
  pid?: string;
}

interface EditorQueryParams {
  source?: string;
  pid?: string;
}

interface EditorSchemaFormResponse {
  schema: {
    properties?: {
      metadata?: unknown;
    };
  };
}

interface EditorRecordLoadResult {
  result: ActionStatus | boolean | null;
  record: JsonObject;
}

interface EditorRecordActionResult {
  record: RecordData<JsonObject>;
  action: 'update' | 'create';
  message: string;
}

@Component({
  selector: 'ng-core-editor',
  templateUrl: './editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Tooltip,
    Button,
    SplitButton,
    Divider,
    AddFieldEditorComponent,
    FormlyModule,
    TranslateDirective,
    ErrorComponent,
    TranslatePipe,
    UpperCaseFirstPipe,
  ],
})
export class EditorComponent<TMetadata extends JsonObject = JsonObject>
  extends AbstractCanDeactivateComponent
  implements OnInit, OnChanges, OnDestroy
{
  protected formlyJsonschema: FormlyJsonschema = inject(FormlyJsonschema);
  protected recordService: RecordService = inject(RecordService);
  protected apiService: ApiService = inject(ApiService);
  protected route: ActivatedRoute = inject(ActivatedRoute);
  protected recordUiService: RecordUiService = inject(RecordUiService);
  protected translateService: TranslateService = inject(TranslateService);
  protected location: Location = inject(Location);
  protected routeCollectionService: RouteCollectionService = inject(RouteCollectionService);
  protected jsonschemaService: JSONSchemaService = inject(JSONSchemaService);
  protected dialogService: DialogService = inject(DialogService);
  protected messageService: MessageService = inject(MessageService);
  protected cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  // form initial values
  readonly model = input<JsonValue | null>(null);
  formlyModel = signal<any>(null);

  // JSONSchema
  readonly schema = input<JSONSchema7 | undefined>(undefined);
  protected _schema = signal<any>(undefined);

  // store pid on edit mode
  readonly pid = input<string | null>(null);
  protected _pid = signal<string>('');

  // initial values changes notification
  readonly modelChange = output<JsonValue | null>();

  // editor loading state notifications
  readonly loadingChange = output<boolean>();

  // editor can deactivate change notification
  readonly canDeactivateChange = output<boolean>();

  // Resource title
  title = signal<string | undefined>(undefined);

  // Resource description
  description = signal<string | undefined>(undefined);

  // Can Deactivate
  canDeactivate = false;

  // angular formGroup root
  form: UntypedFormGroup;

  // additional form options
  options = signal<FormlyFormOptions>({});

  // form configuration
  fields = signal<FormlyFieldConfig[]>([]);

  // root element of the editor
  rootField = signal<FormlyFieldConfig | null>(null);

  // list of fields to display in the TOC
  readonly tocFields = computed(() => {
    this.hiddenFields();
    const fieldList = this.fields();
    if (fieldList.length === 0) {
      return [];
    }
    return (
      fieldList[0]?.fieldGroup?.filter((f) => {
        if (f.hide === true) {
          return false;
        }
        if (f.props?.alwaysHidden) {
          return false;
        }
        return true;
      }) ?? []
    );
  });

  // editor settings
  readonly editorSettings = model({
    longMode: false, // editor long mode
    getHeaders: null, // optional headers to use when loading a model
    template: {
      recordType: '', // the resource considerate as template
      loadFromTemplate: false, // enable load from template button
      saveAsTemplate: false, // allow to save the record as a template
    },
  });

  // save alternatives
  saveAlternatives = signal<{ label: string; command: () => void }[]>([]);

  // current record type from the url
  recordType = signal('');

  // If an error occurred, it is stored, to display in interface.
  error = signal<Error | null>(null);

  /** Disables the save button during the action */
  isSaveButtonDisabled = signal(false);

  // subscribers
  private _subscribers: Subscription = new Subscription();

  // Config for resource
  private _resourceConfig: ResourceConfigType | null = null;

  // list of fields to be hidden
  private _hiddenFields = signal<FormlyFieldConfig[]>([]);

  // current list of hidden fields
  readonly hiddenFields = computed(() => this._hiddenFields());

  // Dialog Ref
  ref: DynamicDialogRef | null = null;

  // Editor long mode
  public get longMode(): boolean {
    return this.editorSettings().longMode;
  }

  // Editor function
  public get editorComponent(): () => EditorComponent<TMetadata> {
    return () => this;
  }

  /** Constructor */
  constructor() {
    super();
    this.form = new UntypedFormGroup({});
  }

  /**
   * Component has changed
   * Called before ngOnInit() and whenever one of the input properties change.
   * @param changes: the changed properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    const schema = this._schema();
    if (changes.model && !changes.model.isFirstChange()) {
      // Model has changed
      this._setModel(changes.model.currentValue);
      // needed to select the right value for existing data in the multi select
      // components such as oneOf
      if (schema) {
        this.setSchema(schema);
      }
    }
    if (changes.schema) {
      // Schema has changed
      this.setSchema(changes.schema.currentValue);
    }
    if (changes.pid) {
      // Assign pid on schema. Reload schema
      this._pid.set(changes.pid.currentValue);
      if (schema) {
        this.setSchema(schema);
      }
    }
  }

  /** onInit hook */
  ngOnInit(): void {
    this._subscribers.add(
      combineLatest([this.route.params, this.route.queryParams])
        .pipe(switchMap(([params, queryParams]) => this.loadEditorData(params, queryParams)))
        .subscribe(),
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
      const modelValue = this.formlyModel();
      if (
        !this._resourceConfig.recordResource &&
        this._pid() != null &&
        (modelValue == null || modelValue.pid == null)
      ) {
        model.pid = this._pid();
      }
      // preprocess the model before sending to formly
      this.formlyModel.set(this.preprocessRecord(model));
      this.modelChanged(this.formlyModel());
      this.cdr.markForCheck();
    }
  }

  /**
   * Emit value when model is changed.
   * @param modelValue Model.
   */
  modelChanged(modelValue: JsonValue): void {
    this.modelChange.emit(removeEmptyValues(modelValue));
  }

  /**
   * Preprocess the record before passing it to the editor
   * @param record - Record object to preprocess
   */
  private preprocessRecord(record: TMetadata): TMetadata {
    const config = this.recordUiService.getResourceConfig<TMetadata>(this.recordType());

    if (config.preprocessRecordEditor) {
      return config.preprocessRecordEditor(record);
    }
    return record;
  }

  /**
   * Postprocess the record before save
   * @param record - Record object to postprocess
   */
  private postprocessRecord(record: TMetadata): TMetadata {
    const config = this.recordUiService.getResourceConfig<TMetadata>(this.recordType());

    if (config.postprocessRecordEditor) {
      return config.postprocessRecordEditor(record);
    }
    return record;
  }

  /**
   * Pre Create Record
   * @param record - Record object
   */
  private preCreateRecord(record: TMetadata): TMetadata {
    const config = this.recordUiService.getResourceConfig<TMetadata>(this.recordType());

    if (config.preCreateRecord) {
      return config.preCreateRecord(record);
    }
    return record;
  }

  /**
   * Pre Update Record
   * @param record - Record object
   */
  private preUpdateRecord(record: TMetadata): TMetadata {
    const config = this.recordUiService.getResourceConfig<TMetadata>(this.recordType());

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
    this._schema.set(processJsonSchema(resolve$ref(schema, schema.properties)));
    this.options.set({});

    // remove hidden field list in case of a previous setSchema call
    this.clearHiddenFields();

    // form configuration
    const editorConfig = {
      pid: this._pid(),
      longMode: this.longMode,
      recordType: this.recordType(),
    };
    const fields = [
      this.formlyJsonschema.toFieldConfig(this._schema(), {
        // post process JSONSChema7 to FormlyFieldConfig conversion
        map: (field, jsonSchema): FormlyFieldConfig => {
          /**** additional JSONSchema configurations *******/
          field = this.jsonschemaService.processField(field, jsonSchema as JSONSchema7);
          if (!field.props) {
            field.props = {};
          }
          field.props.editorConfig = editorConfig;
          field.props.getRoot = () => this.rootField();
          field.props.setHide = (field: FormlyFieldConfig, value: boolean) => this.setHide(field, value);
          if (this._resourceConfig != null && this._resourceConfig.formFieldMap) {
            return this._resourceConfig.formFieldMap(field, jsonSchema as unknown as JSONSchema7);
          }
          return field;
        },
      }),
    ];
    // mark the root field
    if (fields[0]?.props) {
      fields[0].props.isRoot = true;
    }

    this.fields.set(fields);

    // set root element
    if (fields.length > 0) {
      this.title.set(fields[0].props?.label);
      this.description.set(fields[0].props?.description);
      this.rootField.set(fields[0]);
    }
    this.cdr.markForCheck();
  }

  /**
   * Save the data on the server.
   */
  submit(): void {
    this.isSaveButtonDisabled.set(true);
    this.form.markAllAsTouched();

    if (this.form.valid === false) {
      const fields: string[] = [];
      Object.keys(this.form.controls).forEach((key: string) => {
        if (this.form.controls[key].status !== 'VALID') {
          fields.push(this.translateService.instant(key));
        }
      });
      let errorMessage = '';
      if (fields.length > 0) {
        errorMessage += '\n' + this.translateService.instant('Field(s) in error: ');
        errorMessage += fields.join(', ');
      }
      this.messageService.add({
        severity: 'error',
        summary: this.translateService.instant(this.recordType()),
        detail: this.translateService.instant('The form contains errors.') + errorMessage,
        sticky: true,
        closable: true,
      });
      this.isSaveButtonDisabled.set(false);
      return;
    }

    this._canDeactivate();
    this.loadingChange.emit(true);

    let data = removeEmptyValues(this.formlyModel());
    data = this.postprocessRecord(data);

    // For compatibility with resources managed with invenio-records-resources
    if (this._resourceConfig?.recordResource) {
      data = { metadata: data };
    }

    let recordAction$: Observable<EditorRecordActionResult>;
    if (this._pid() != null) {
      recordAction$ = this.recordService.update(this.recordType(), this._pid(), this.preUpdateRecord(data)).pipe(
        catchError((error) => this._handleError(error)),
        map((record) => {
          return { record, action: 'update' as const, message: this.translateService.instant('Record updated.') };
        }),
        finalize(() => this.isSaveButtonDisabled.set(false)),
      );
    } else {
      recordAction$ = this.recordService.create(this.recordType(), this.preCreateRecord(data)).pipe(
        catchError((error) => this._handleError(error)),
        map((record) => {
          return { record, action: 'create' as const, message: this.translateService.instant('Record created.') };
        }),
        finalize(() => this.isSaveButtonDisabled.set(false)),
      );
    }

    this._subscribers.add(
      recordAction$.subscribe((result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant(this.recordType()),
          detail: this.translateService.instant(result.message),
          life: CONFIG.MESSAGE_LIFE,
        });
        this.recordUiService.redirectAfterSave(
          result.record.id,
          result.record,
          this.recordType(),
          result.action,
          this.route,
        );
        this.loadingChange.emit(true);
        this.cdr.markForCheck();
      }),
    );
  }

  /** Save the current editor content as a template */
  saveAsTemplate(): void {
    this.ref = this.dialogService.open(SaveTemplateFormComponent, {
      header: this.translateService.instant('Save as template'),
      width: '40vw',
    });
    this._subscribers.add(
      this.ref?.onClose.subscribe((data: { name?: string } | null) => {
        if (data?.name) {
          let modelData = removeEmptyValues(this.formlyModel());
          modelData = this.postprocessRecord(modelData);
          let record: TemplateMetadata = {
            name: data.name,
            data: modelData,
            template_type: this.recordType(),
          };
          const tmplConfig = this.recordUiService.getResourceConfig<TemplateMetadata>(
            this.editorSettings().template.recordType,
          );
          if (tmplConfig.preCreateRecord) {
            record = tmplConfig.preCreateRecord(record);
          }
          this.loadingChange.emit(true);
          this._subscribers.add(
            this.recordService.create<TemplateMetadata>(this.editorSettings().template.recordType, record).subscribe({
              next: (createdRecord) => {
                const editorSettings = this.editorSettings();
                this.messageService.add({
                  severity: 'success',
                  summary: this.translateService.instant(editorSettings.template.recordType),
                  detail: this.translateService.instant('Record created.'),
                  life: CONFIG.MESSAGE_LIFE,
                });
                this.recordUiService.redirectAfterSave<TemplateMetadata>(
                  createdRecord.id,
                  createdRecord,
                  editorSettings.template.recordType,
                  'create',
                  this.route,
                );
                this.cdr.markForCheck();
              },
              error: (error) => {
                this.loadingChange.emit(false);
                this.messageService.add({
                  severity: 'error',
                  summary: this.translateService.instant(this.editorSettings().template.recordType),
                  detail: error.title,
                  sticky: true,
                  closable: true,
                });
                this.cdr.markForCheck();
              },
            }),
          );
        }
      }),
    );
  }

  /**
   * Scroll the window in to the DOM element corresponding to a given config field.
   * @param event - click DOM event
   * @param field - FormlyFieldConfig, the form config corresponding to the DOM element to jump to.
   */
  setFocus(event: Event, field: FormlyFieldConfig): void {
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
    this.dialogService.open(LoadTemplateFormComponent, {
      header: this.translateService.instant('Load from template'),
      focusOnShow: false,
      width: '50vw',
      position: 'top',
      modal: true,
      dismissableMask: false,
      data: {
        templateResourceType: this.editorSettings().template.recordType,
        resourceType: this.recordType(),
      },
    });
  }

  /**
   * Can the `load template` should be visible.
   * The 'load template' button will be visible only if the corresponding setting is set and the user
   * isn't in 'edit mode' (load template is only available for new resources)
   * @return True if the button could be visible ; False otherwise
   */
  canLoadTemplate(): boolean {
    return this.editorSettings().template.loadFromTemplate && !this._pid();
  }

  /********** Form field manipulation **********/

  /**
   * Scroll to a field or fieldGroup and set focus in the first field candidate.
   * @param field: the field or fieldGroup where to search about field candidate.
   * @param scroll: is the screen should scroll to the field.
   */
  setFieldFocus(field: FormlyFieldConfig, scroll = false): boolean {
    if (scroll === true && field.id) {
      const el = document.getElementById(`field-${field.id}`);
      if (el != null) {
        // we need to scroll after the focus setTimeout push the action in the
        // next event loop.
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }));
        scroll = false;
      }
    }
    if (field.fieldGroup && field.fieldGroup.length > 0) {
      const visibleFields = field.fieldGroup.filter((f) => !f.hide);
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
    if (field.parent && this.isRoot(field.parent)) {
      // formly can change the reference of a field. Especially when the model
      // change such as external import.
      this._hiddenFields.update((fields) => {
        const updated = fields.filter((f) => f.id !== field.id);
        updated.push(field);
        return updated;
      });
    }
  }

  /**
   * Clear the list of the hidden fields
   */
  clearHiddenFields(): void {
    this._hiddenFields.set([]);
  }

  /**
   * Remove a field to the hidden list
   * @param field - FormlyFieldConfig, form config to be removed
   */
  removeHiddenField(field: FormlyFieldConfig): void {
    if (this.hiddenFields().some((f) => f.id === field.id) && this.isRoot(field.parent ?? null)) {
      // Form is touched if a field is added.
      // Required for hide field in edit mode.
      this.rootField()?.formControl?.markAsTouched();
      this._hiddenFields.update((fields) => fields.filter((f) => f.id !== field.id));
    }
  }

  /**
   * Am I at the root of the form?
   * @param field - FormlyFieldConfig, the field to hide
   * @returns boolean, true if I'm the root
   */
  isRoot(field: FormlyFieldConfig | null): boolean {
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
    return !field.props?.required && !field.hide && !field?.expressions?.hide;
  }

  /**
   * Hide the given formly field.
   * @param field - FormlyFieldConfig, the field to hide
   */
  setHide(field: FormlyFieldConfig, value: boolean, scroll = false): void {
    if (value) {
      if (field.parent?.props?.isRoot) {
        this.addHiddenField(field);
      }
    } else {
      this.removeHiddenField(field);
      this.setFieldFocus(field, scroll);
    }
    field.hide = value;
  }

  /********************* Private  ***************************************/

  /**
   * Handle form error
   * @param error: object with status and title parameters
   * @return Observable<Error>
   */
  private _handleError(error: { status: number; title: string }): Observable<never> {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant(error.title),
      detail: this.translateService.instant('Server error.'),
      sticky: true,
      closable: true,
    });
    return throwError(() => ({ status: error.status, title: error.title }));
  }

  private _canDeactivate(activate = true): void {
    this.canDeactivate = activate;
    this.canDeactivateChange.emit(activate);
  }

  private loadEditorData(params: EditorRouteParams, queryParams: EditorQueryParams): Observable<void> {
    // uncomment for debug
    // this.form.valueChanges.subscribe(v =>
    //   console.log('model', this.model(), 'v', v, 'form', this.form, 'field', this.fields)
    // );
    this.loadingChange.emit(true);
    if (!params.type) {
      this.formlyModel.set({});
      this._schema.set({});
      this.loadingChange.emit(false);
      this.cdr.markForCheck();
      return of(void 0);
    }

    this.recordType.set(params.type);
    this.recordUiService.types = this.route.snapshot.data.types;

    this._resourceConfig = this.recordUiService.getResourceConfig(this.recordType());
    if (this._resourceConfig?.editorSettings) {
      const mergedSettings: ReturnType<EditorComponent['editorSettings']> = {
        ...cloneDeep(this.editorSettings()),
        ...(this._resourceConfig.editorSettings as Partial<ReturnType<EditorComponent['editorSettings']>>),
      };
      this.editorSettings.set(mergedSettings);
    }

    const editorSettings = this.editorSettings();
    if (editorSettings.template.recordType !== '') {
      const tmplResource = this.routeCollectionService.getRoute(editorSettings.template.recordType);
      const tmplConfiguration = tmplResource()?.getConfiguration();
      if (tmplConfiguration?.data?.types) {
        this.recordUiService.types = this.recordUiService.types.concat(tmplConfiguration.data.types);
      }
    }

    this.saveAlternatives.set([]);
    if (editorSettings.template.saveAsTemplate) {
      this.saveAlternatives.update((items) => [
        ...items,
        {
          label: this.translateService.instant('Save as template') + '…',
          command: () => this.saveAsTemplate(),
        },
      ]);
    }

    this._pid.set(params.pid ?? '');
    const schema$ = this.recordService.getSchemaForm(
      this.recordType(),
    ) as unknown as Observable<EditorSchemaFormResponse>;
    let record$: Observable<EditorRecordLoadResult> = of({ record: {}, result: null });
    const pid = this._pid();

    if (queryParams.source === 'templates' && queryParams.pid != null) {
      record$ = this.recordService.getRecord<RecordData<{ data: JsonObject }>>('templates', queryParams.pid).pipe(
        map((record) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('Template'),
            detail: this.translateService.instant('Template loaded'),
            life: CONFIG.MESSAGE_LIFE,
          });
          return {
            result: true,
            record: record.metadata.data,
          };
        }),
      );
    } else if (pid) {
      record$ = this.recordService
        .getRecord<RecordData<JsonObject>>(this.recordType(), pid, {
          headers: editorSettings.getHeaders || new HttpHeaders({ 'Content-Type': 'application/json' }),
        })
        .pipe(
          switchMap((record) => {
            return this.recordUiService.canUpdateRecord$(record, this.recordType()).pipe(
              map((result) => {
                return {
                  result,
                  record: record.metadata,
                };
              }),
            );
          }),
        );
    }

    return combineLatest([schema$, record$]).pipe(
      map(([schemaform, data]) => {
        const editorSchema = this._resourceConfig?.recordResource
          ? (schemaform.schema.properties?.metadata ?? schemaform.schema)
          : schemaform.schema;
        this.setSchema(editorSchema);

        if (typeof data.result === 'object' && data.result !== null && data.result.can === false) {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant(this.recordType()),
            detail: this.translateService.instant('You cannot update this record'),
            sticky: true,
            closable: true,
          });
          this.location.back();
        } else {
          this._setModel(data.record);
        }
      }),
      map(() => void 0),
      catchError((error) => {
        this.error.set(error);
        return of(void 0);
      }),
      finalize(() => {
        this.loadingChange.emit(false);
        this.cdr.markForCheck();
      }),
    );
  }
}
