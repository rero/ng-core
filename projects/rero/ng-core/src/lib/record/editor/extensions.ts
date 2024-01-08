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
import { UntypedFormControl } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import moment from 'moment';
import { isObservable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RecordService } from '../record.service';
import { isEmpty, removeEmptyValues } from './utils';

export class NgCoreFormlyExtension {
  // Types to apply horizontal wrapper on
  private _horizontalWrapperTypes = [
    'enum',
    'string',
    'remoteTypeahead',
    'selectWithSort',
    'integer',
    'textarea',
    'datepicker'
  ];

  // Types to apply field wrapper on
  private _fieldWrapperTypes = ['boolean', 'datepicker', 'passwordGenerator', 'remoteTypeahead', 'selectWithSort'];

  /**
   * Constructor
   * @params _recordService - ng core record service
   */
  constructor(private _recordService: RecordService) {}

  /**
   * prePopulate Formly hook
   * @param field - FormlyFieldConfig
   */
  prePopulate(field: FormlyFieldConfig): void {
    if (field.key) {
      field.id = this._getKey(field);
    }
    this._setCustomValidators(field);
    // Set default value from expression.
    if (field.templateOptions?.defaultValueExpression) {
      const expression = field.templateOptions.defaultValueExpression;
      const expressionFn = Function('expression', `return ${expression};`);
      field.defaultValue = expressionFn();
    }
  }

  /**
   * onPopulate Formly hook
   * @param field - FormlyFieldConfig
   */
  onPopulate(field: FormlyFieldConfig): void {
    this._setWrappers(field);
    this._hideEmptyField(field);
    const expressionProperties = field?.expressionProperties;
    if (expressionProperties && expressionProperties['templateOptions.required'] !== undefined) {
      field.options.fieldChanges.subscribe((changes) => {
        if (
          changes.type === 'expressionChanges' &&
          changes.property === 'templateOptions.required' &&
          changes.value === true
        ) {
          if (changes.field.hide === true) {
            changes.field.hide = false;
          }
        }
      });
    }
  }

  /**
   * Add formly wrappers
   * @param field - FormlyFieldConfig
   */
  private _setWrappers(field: FormlyFieldConfig): void {
    // get wrappers from the templateOptions (JSONSchema)
    if (field.templateOptions) {
      field.wrappers = [
        ...(field.templateOptions.wrappers ? field.templateOptions.wrappers : []),
        ...(field.wrappers ? field.wrappers : []),
      ];
    }

    const editorComponent = field.templateOptions?.editorComponent;
    if (field.templateOptions && editorComponent && editorComponent().longMode) {
      // add automatically a card wrapper for the first level fields
      const parent = field.parent;
      if (parent && parent.templateOptions && parent.templateOptions.isRoot === true) {
        if (!field.wrappers.includes('card')) {
          field.wrappers.push('card');
        }
      }
      // Add an horizontal wrapper for all given field types
      if (this._horizontalWrapperTypes.some((elem) => elem === field.type)) {
        field.wrappers = field.wrappers.filter((w) => w !== 'form-field');
        field.wrappers.push('form-field-horizontal');
      }
    } else {
      // adds form-fields for non standard field types
      if (this._fieldWrapperTypes.some((elem) => elem === field.type)) {
        field.wrappers = [...(field.wrappers ? field.wrappers : []), 'form-field'];
      }
    }
    // TODO: this can be fixed in a future formly release
    // due to multiple calls (sometimes) we need to make the value unique
    field.wrappers = [...new Set(field.wrappers)];
  }

  /**
   * Create an id html attribute by joining field and parents keys
   * @param field formly field config
   * @returns array - keys to create the id html attribute
   */
  private _getKey(field: any): string {
    let parentKey = null;
    const keyParams = [];

    if (field.parent != null) {
      parentKey = this._getKey(field.parent);
      keyParams.push(parentKey);
    }

    if (parentKey != null) {
      if (field.key != null) {
        keyParams.push(field.key);
      } else {
        keyParams.push(field.id.replace(/.*__(\d+)$/, '$1'));
      }

      return keyParams.join('-');
    }
    return field.key;
  }

  /**
   * Check if the given field or one of his parents has a hide wrapper
   * @param field - FormlyFieldConfig
   * @return boolean - true if has a hide wrapper
   */
  private _hasHideWrapper(field): boolean {
    if ('hide' in field.wrappers) {
      return true;
    }
    if (field?.parent) {
      return this._hasHideWrapper(field.parent);
    }
    return false;
  }

  /**
   * Check if the given field has at least on parent marked as hidden.
   * The model should be empty.
   *
   * @param field - FormlyFieldConfig
   * @return boolean - true has a parent marked as hidden.
   */
  private _hasHiddenParent(field): boolean {
    if (field?.hide === true) {
      return this._modelIsEmpty(field);
    }
    if (field?.parent) {
      return this._hasHiddenParent(field.parent);
    }
    return false;
  }

  /**
   * Check if a field has an empty model.
   *
   * @param field formly field config
   * @returns true if the given field has an empty model.
   */
  private _modelIsEmpty(field): boolean {
    let model = field?.model;
    // for simple object the model is the parent dict
    if (field.model != null && !field.hasOwnProperty('fieldGroup')) {
      // New from ngx-formly v5.9.0
      model = field.model[Array.isArray(field.key) ? field.key[0] : field.key];
    }
    model = removeEmptyValues(model);
    return isEmpty(model);
  }

  /**
   * Hide or show field depending of the data content and the hide property
   * @param field - FormlyFieldConfig
   */
  private _hideEmptyField(field: FormlyFieldConfig): void {
    // find the root field in the form tree
    if (!field.templateOptions?.editorComponent) {
      return;
    }
    // root field
    const rootField = field.templateOptions.editorComponent().rootField;
    // edition mode
    const editMode = field.templateOptions.editorComponent().editMode;
    // long mode
    const longMode = field.templateOptions.editorComponent().longMode;
    if (
      // only in longMode else it will not be possible to unhide a field
      !longMode ||
      // system field has not key
      !field?.key ||
      // ignore array item which as key of the form "0"
      // TODO: find a better way to identify this case
      !isNaN(Number(field.key)) ||
      // do not hide a field containing a 'hide' wrapper
      this._hasHideWrapper(field) ||
      // do not hide a field that has a parent maked as hidden and a model is empty
      (this._hasHiddenParent(field?.parent) && field.templateOptions.hide !== true)
    ) {
      return;
    }

    // is the model empty
    const modelEmpty = this._modelIsEmpty(field);
    if (
      // do not hide field which has value in the model
      modelEmpty &&
      // do not hide required fields
      !field?.templateOptions?.initialRequired
    ) {
      if (
        // hide field marked as hide
        (field.templateOptions.hide === true &&
          // do not hide field has been already manipulated
          field.hide === undefined) ||
        // in edition empty fields should be hidden
        (editMode === true &&
          // only during the editor initialisation
          !rootField?.formControl?.touched)
      ) {
        field.hide = true;
        field.templateOptions.editorComponent().addHiddenField(field);
      }
    }
  }

  /**
   * Set custom validators from the templateOptions configuration.
   * @param field - FormlyFieldConfig
   */
  private _setCustomValidators(field: FormlyFieldConfig): void {
    if (field.templateOptions == null || field.templateOptions.customValidators == null) {
      return;
    }
    const customValidators = field.templateOptions.customValidators ? field.templateOptions.customValidators : {};
    // asyncValidators: valueAlreadyExists
    if (customValidators.valueAlreadyExists) {
      const remoteRecordType = customValidators.valueAlreadyExists.remoteRecordType;
      const limitToValues = customValidators.valueAlreadyExists.limitToValues;
      const filter = customValidators.valueAlreadyExists.filter;
      const term = customValidators.valueAlreadyExists.term;
      const editorComponent = field.templateOptions.editorComponent;
      field.asyncValidators = {
        validation: [
          (control: UntypedFormControl) => {
            return this._recordService.uniqueValue(
              field,
              remoteRecordType ? remoteRecordType : editorComponent().recordType,
              editorComponent().pid,
              term ? term : null,
              limitToValues ? limitToValues : [],
              filter ? filter : null
            );
          },
        ],
      };
      delete customValidators.valueAlreadyExists;
    }
    // asyncValidators: valueKeysInObject
    //  This validator is similar to uniqueValidator but only check on some specific fields of array items.
    if (customValidators.uniqueValueKeysInObject) {
      field.validators = {
        uniqueValueKeysInObject: {
          expression: (control: UntypedFormControl) => {
            // if value isn't an array or array contains less than 2 elements, no need to check
            if (!(control.value instanceof Array) || control.value.length < 2) {
              return true;
            }
            const keysToKeep = customValidators.uniqueValueKeysInObject.keys;
            const uniqueItems = Array.from(
              new Set(
                control.value.map((v: any) => {
                  const keys = keysToKeep.reduce((acc, elt) => {
                    acc[elt] = v[elt];
                    return acc;
                  }, {});
                  return JSON.stringify(keys);
                })
              )
            );
            return uniqueItems.length === control.value.length;
          },
        },
      };
    }
    // asyncValidators: numberOfSpecificValuesInObject
    if (customValidators.numberOfSpecificValuesInObject) {
      field.validators = {
        numberOfSpecificValuesInObject: {
          expression: (control: UntypedFormControl) => {
            function objIntersection(a, b) {
              const k1 = Object.keys(a);
              return k1.filter((k) => a[k] === b[k]);
            }
            const min = customValidators.numberOfSpecificValuesInObject.min || 0;
            const max = customValidators.numberOfSpecificValuesInObject.max || Infinity;
            const keys = customValidators.numberOfSpecificValuesInObject.keys;

            // if value isn't an array and no minimum value is specified, no need to check.
            if (!(control.value instanceof Array) && min === 0) {
              return true;
            }
            const counter = control.value.filter((element) => objIntersection(keys, element).length > 0).length;
            return min <= counter && counter <= max;
          },
        },
      };
    }
    // The start date must be less than the end date.
    if (customValidators.dateMustBeLessThan) {
      const startDate: string = customValidators.dateMustBeLessThan.startDate;
      const endDate: string = customValidators.dateMustBeLessThan.endDate;
      const strict: boolean = customValidators.dateMustBeLessThan.strict || false;
      const updateOn: 'change' | 'blur' | 'submit' = customValidators.dateMustBeLessThan.strict || 'blur';
      field.validators = {
        dateMustBeLessThan: {
          updateOn,
          expression: (control: UntypedFormControl) => {
            const startDateFc = control.parent.get(startDate);
            const endDateFc = control.parent.get(endDate);
            if (startDateFc.value !== null && endDateFc.value !== null) {
              const dateStart = moment(startDateFc.value, 'YYYY-MM-DD');
              const dateEnd = moment(endDateFc.value, 'YYYY-MM-DD');
              const isMustLessThan = strict
                ? dateStart >= dateEnd
                  ? false
                  : true
                : dateStart > dateEnd
                ? false
                : true;
              if (isMustLessThan) {
                endDateFc.setErrors(null);
                endDateFc.markAsDirty();
              }
              return isMustLessThan;
            }
            return false;
          },
        },
      };
    }

    // The end date must be greater than the start date.
    if (customValidators.dateMustBeGreaterThan) {
      const startDate: string = customValidators.dateMustBeGreaterThan.startDate;
      const endDate: string = customValidators.dateMustBeGreaterThan.endDate;
      const strict: boolean = customValidators.dateMustBeGreaterThan.strict || false;
      const updateOn: 'change' | 'blur' | 'submit' = customValidators.dateMustBeGreaterThan.strict || 'blur';
      field.validators = {
        datesMustBeGreaterThan: {
          updateOn,
          expression: (control: UntypedFormControl) => {
            const startDateFc = control.parent.get(startDate);
            const endDateFc = control.parent.get(endDate);
            if (startDateFc.value !== null && endDateFc.value !== null) {
              const dateStart = moment(startDateFc.value, 'YYYY-MM-DD');
              const dateEnd = moment(endDateFc.value, 'YYYY-MM-DD');
              const isMustBeGreaterThan = strict
                ? dateStart <= dateEnd
                  ? true
                  : false
                : dateStart < dateEnd
                ? true
                : false;
              if (isMustBeGreaterThan) {
                startDateFc.setErrors(null);
                startDateFc.markAsDirty();
              }
              return isMustBeGreaterThan;
            }
            return false;
          },
        },
      };
    }
  }
}

export class TranslateExtension {
  /**
   * Constructor.
   *
   *  @param translate ngx-translate service
   */
  constructor(private _translate: TranslateService) {}

  /**
   * Translate some fields before populating the form.
   *
   * It translates the label, the description and the placeholder.
   * @param field formly field config
   */
  prePopulate(field: FormlyFieldConfig): void {
    const to = field.templateOptions || {};

    // translate only once
    if (to._translated) {
      return;
    }
    to._translated = true;

    // label / title
    if (to.label) {
      // store the untranslated label as the hidden fields are not translated
      to.untranslatedLabel = to.label;
      field.expressionProperties = {
        ...(field.expressionProperties || {}),
        'templateOptions.label': this._translate.stream(to.label),
      };
    }
    // description
    if (to.description) {
      field.expressionProperties = {
        ...(field.expressionProperties || {}),
        'templateOptions.description': this._translate.stream(to.description),
      };
    }
    // placeholder
    if (to.placeholder) {
      field.expressionProperties = {
        ...(field.expressionProperties || {}),
        'templateOptions.placeholder': this._translate.stream(to.placeholder),
      };
    }
    // Options
    if (to.options) {
      // Process only if the array options is observable or contains a dictionary with label/value
      if (isObservable(to.options) || to.options.some((o: any) => 'label' in o && 'value' in o)) {
        to.options = !isObservable(to.options) ? of(to.options) : to.options;
        to.options = to.options.pipe(
          switchMap((opts: any) => {
            const labels = [];
            const options = [];
            opts.forEach((opt: any) => {
              labels.push(opt.label);
              options.push(opt);
            });
            return this._translate.stream(labels).pipe(
              map((translations: any) => {
                const output = [];
                options.forEach((opt: any) => {
                  const data = cloneDeep(opt);
                  data.label = translations[opt.label];
                  output.push(data);
                });
                return output;
              })
            );
          })
        );
      }
    }
    // AddonRight or AddonLeft
    if (to.addonRight?.text) {
      // Store original text to the new key
      to.addonRight.originalText = to.addonRight.text;
      to.addonRight.text = this._translate.instant(to.addonRight.originalText);
      this._translate.onLangChange.subscribe(() => to.addonRight.text = this._translate.instant(to.addonRight.originalText));
    }
    if (to.addonLeft?.text) {
      // Store original text to the new key
      to.addonLeft.originalText = to.addonLeft.text;
      this._translate.instant(to.addonLeft.originalText);
      this._translate.onLangChange.subscribe(() => to.addonLeft.text = this._translate.instant(to.addonLeft.originalText));
    }
  }
}

/**
 * To register an ngx-formly translations extension.
 *
 * @param translate ngx-translate service
 * @param recordService - ng core record service
 * @returns FormlyConfig object configuration
 */
export function registerNgCoreFormlyExtension(
  translate: TranslateService,
  recordService: RecordService
) {
  return {
    // translate the default validators messages
    // widely inspired from ngx-formly example
    validationMessages: [
      {
        name: 'formError',
        // use a marker to force translation extraction due to a bad detection of ngx-translate-extract
        message: (err) => translate.stream(err.title),
      },
      {
        name: 'required',
        // use a marker to force translation extraction due to a bad detection of ngx-translate-extract
        message: () => translate.stream(_('This field is required')),
      },
      {
        name: 'null',
        message: () => translate.stream(_('should be null')),
      },
      {
        name: 'uniqueItems',
        message: () => translate.stream(_('should NOT have duplicate items')),
      },
      {
        name: 'uniqueValueKeysInObject',
        message: () => translate.stream(_('should NOT have duplicate items')),
      },
      {
        name: 'numberOfSpecificValuesInObject',
        message: (err, field: FormlyFieldConfig) => {
          const validatorConfig = field.templateOptions.customValidators.numberOfSpecificValuesInObject;
          const min = validatorConfig.min || 0;
          const max = validatorConfig.max || Infinity;
          const keys = validatorConfig.keys;

          // Build a string based on validators specified keys
          // the object `{a: 'testA', b= 'testB'}` will be transform to a string `a=testA and b=testB`
          const keysString = Object.keys(keys).map((key) => key + '=' + translate.instant(keys[key]));
          const joinKeysString = keysString.join(' ' + translate.instant('and') + ' ');

          // Build a string based on min/max values specified into configuration
          // depending of min/max configuration, the message must be different
          let counterMessage = '';
          if (min > 0 && max < Infinity) {
            counterMessage =
              min === max
                ? translate.instant(_('strictly {{counter}}'), { counter: min })
                : translate.instant(_('between {{min}} and {{max}}'), { min, max });
          } else if (min > 0) {
            counterMessage = translate.instant(_('minimum {{min}}'), { min });
          } else if (max < Infinity) {
            counterMessage = translate.instant(_('maximum {{max}}'), { max });
          }

          // Combine string to return a full sentence
          return translate.instant(_('should have {{counter}} {{keys}}'), {
            counter: counterMessage,
            keys: joinKeysString,
          });
        },
      },
      {
        name: 'alreadyTaken',
        message: () => translate.stream(_('the value is already taken')),
      },
      {
        name: 'minlength',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT be shorter than {{minLength}} characters'), {
            minLength: field.templateOptions.minLength,
          }),
      },
      {
        name: 'maxlength',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT be longer than {{maxLength}} characters'), {
            maxLength: field.templateOptions.maxLength,
          }),
      },
      {
        name: 'minItems',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT have fewer than {{minItems}} items'), {
            minItems: field.templateOptions.minItems,
          }),
      },
      {
        name: 'maxItems',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT have more than {{maxItems}} items'), {
            maxItems: field.templateOptions.maxItems,
          }),
      },
      {
        name: 'min',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be >=  {{min}}'), { min: field.templateOptions.min }),
      },
      {
        name: 'max',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be <=  {{max}}'), { max: field.templateOptions.max }),
      },
      {
        name: 'exclusiveMinimum',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be >  {{step}}'), { step: field.templateOptions.step }),
      },
      {
        name: 'exclusiveMaximum',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be <  {{step}}'), { step: field.templateOptions.step }),
      },
      {
        name: 'multipleOf',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be multiple of ${{step}}'), { step: field.templateOptions.step }),
      },
      {
        name: 'const',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be equal to constant "{{const}}"'), { const: field.templateOptions.const }),
      },
    ],
    extensions: [
      {
        name: 'translate',
        extension: new TranslateExtension(translate),
      },
      {
        name: 'ng-core',
        extension: new NgCoreFormlyExtension(recordService),
        // Execute Core Formly extension after formly processing (priority low)
        // https://main.formly.dev/docs/guide/custom-formly-extension#extension-priority
        priority: 10
      }
    ],
  };
}
