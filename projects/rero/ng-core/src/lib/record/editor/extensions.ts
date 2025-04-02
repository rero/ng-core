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
import { inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { _ } from "@ngx-translate/core";
import { FormlyExtension, FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { isObservable, of } from 'rxjs';
import { Validators } from '../../validator/validators';
import { RecordService } from '../record.service';
import { isEmpty, removeEmptyValues } from './utils';

export class NgCoreFormlyExtension {

  protected recordService: RecordService = inject(RecordService);

  // Types to apply field wrapper on
  private _fieldWrapperTypes = ['boolean', 'datepicker', 'passwordGenerator'];

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
    if (field.props?.defaultValueExpression) {
      const expression = field.props.defaultValueExpression;
      const expressionFn = Function('expression', `return ${expression};`);
      field.defaultValue = expressionFn();
    }
  }

  /**
   * onPopulate Formly hook
   * @param field - FormlyFieldConfig
   */
  onPopulate(field: FormlyFieldConfig): void {
    // Path of Array
    // Bug issue: https://github.com/ngx-formly/ngx-formly/issues/3914
    if (field?.parent?.type === 'array' && field.type !== 'object' && field.props.required) {
      field.props.required = false;
    }
    this._setWrappers(field);
    this._hideEmptyField(field);
    if (field.props.alwaysHidden) {
      field.props.itemCssClass = 'core:hidden';
    }
    const expressions = field?.expressions;
    if (expressions && expressions['props.required'] !== undefined) {
      field.options.fieldChanges.subscribe((changes) => {
        if (
          changes.type === 'expressionChanges' &&
          changes.property === 'props.required' &&
          changes.value === true &&
          changes.field.hide === true
        ) {
          changes.field.hide = false;
        }
      });
    }
  }

  /**
   * Add formly wrappers
   * @param field - FormlyFieldConfig
   */
  private _setWrappers(field: FormlyFieldConfig): void {
    // get wrappers from the props (JSONSchema)
    if (field.props) {
      field.wrappers = [...(field.props.wrappers || []), ...(field.wrappers || [])];
    }

    if (field?.props?.editorConfig?.longMode) {
      // add automatically a card wrapper for the first level fields
      const { parent } = field;
      if (parent && parent.props && parent.props.isRoot === true && !field.wrappers.includes('card') && !field.wrappers.includes('hide')) {
        field.wrappers.unshift('card');
      }
    }

    // adds form-fields for non standard field types
    if (this._fieldWrapperTypes.some((elem) => elem === field.type) && !field.wrappers.includes('card')) {
      field.wrappers = [...(field.wrappers || []), 'form-field'];
    }

    // The form-field and the card must not be together
    if (field.wrappers.includes('card')) {
      field.wrappers = field.wrappers.filter((value: string) => value != 'form-field');
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
  private _hasHideWrapper(field: FormlyFieldConfig): boolean {
    if (field.wrappers.includes('hide')) {
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
  private _hasHiddenParent(field: FormlyFieldConfig): boolean {
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
    if (!field.props?.editorConfig) {
      return;
    }
    const { pid, longMode } = field.props?.editorConfig;
    if (
      // only in longMode else it will not be possible to unhide a field
      !longMode ||
      // system field has not key
      !field?.key ||
      // ignore array item which as key of the form "0"
      // TODO: find a better way to identify this case
      !isNaN(Number(field.key)) ||
      // ignore field that has hide expression
      'hide' in field?.expressions ||
      // do not hide a field containing a 'hide' wrapper
      this._hasHideWrapper(field) ||
      // do not hide a field that has a parent marked as hidden and a model is empty
      (this._hasHiddenParent(field?.parent) && field.props.hide !== true)
    ) {
      return;
    }

    // is the model empty
    const modelEmpty = this._modelIsEmpty(field);
    if (
      // do not hide field which has value in the model
      modelEmpty &&
      // do not hide required fields
      !field.props.initialRequired
    ) {
      if (
        // hide field marked as hide
        (field.props.hide === true &&
          // do not hide field has been already manipulated
          field.hide === undefined) ||
        // in edition empty fields should be hidden
        (pid != null &&
          // only during the editor initialization
          !field?.props?.getRoot()?.formControl?.touched)
      ) {
        field.props.setHide ? field.props.setHide(field, true) : (field.hide = true);
      }
    }
  }

  /**
   * Set custom validators from the props configuration.
   * @param field - FormlyFieldConfig
   */
  private _setCustomValidators(field: FormlyFieldConfig): void {
    if (field.props == null || field.props.validation == null) {
      return;
    }
    const customValidators = field.props.validation.validators || {};
    // asyncValidators: valueAlreadyExists
    if (customValidators.valueAlreadyExists) {
      const { filter, limitToValues, term } = customValidators.valueAlreadyExists;
      field.asyncValidators = {
        validation: [
          (control: UntypedFormControl) => {
            return this.recordService.uniqueValue(
              field,
              field.props.editorConfig.recordType,
              field.props.editorConfig.pid,
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
    if (customValidators.datesGreaterThan) {
      const dateFirst: string = customValidators.datesGreaterThan.dateFirst;
      const dateLast: string = customValidators.datesGreaterThan.dateLast;
      const strict: boolean = customValidators.datesGreaterThan.strict || false;
      const updateOn: 'change' | 'blur' | 'submit' = customValidators.datesGreaterThan.updateOn || 'blur';
      const fieldKey = String(field.key);
      field.validators = {
        datesGreaterThan: {
          updateOn,
          expression: (control: UntypedFormControl) => Validators.datesGreaterThan(dateFirst, dateLast, fieldKey, strict)(control),
          message: () => field.props.validation.messages.datesGreaterThan
        },
      };
    }
  }
}

export class TranslateExtension implements FormlyExtension {

  protected translate: TranslateService = inject(TranslateService);

  prePopulate(field: FormlyFieldConfig<FormlyFieldProps & { [additionalProperties: string]: any; }>): void {
    const props: any = field.props || {};

    // translate only once
    if (props.translated) {
      return;
    }
    props.translated = true;

    // label / title
    if (props.label) {
      // store the untranslated label as the hidden fields are not translated
      props.untranslatedLabel = props.label;
      field.expressions = {
        ...(field.expressions || {}),
        'props.label': this.translate.stream(props.label),
      };
    }
    // description
    if (props.description) {
      field.expressions = {
        ...(field.expressions || {}),
        'props.description': this.translate.stream(props.description),
      };
    }
    // placeholder
    if (props.placeholder) {
      field.expressions = {
        ...(field.expressions || {}),
        'props.placeholder': this.translate.stream(props.placeholder),
      };
    }

    // Save untranslated string
    if (props.addonLeft) {
      props.addonLeftUntranslated = props.addonLeft;
    }
    if (props.addonRight) {
      props.addonRightUntranslated = props.addonRight;
    }

    this.processAllAddon(props);
    this.translate.onLangChange.subscribe(() => {
      this.processAllAddon(props);
    });
  }

  private processAllAddon(props: any): void {
    if (props.addonLeft) {
      props.addonLeft = this.processAddon(props.addonLeftUntranslated);
    }
    if (props.addonRight) {
      props.addonRight = this.processAddon(props.addonRightUntranslated);
    }
  }

  private processAddon(addon: string[]): any {
    return addon.map((label: string) => (label.startsWith('<') ? label : this.translate.instant(label)));
  }
}

export class FormOptionsProcessExtension implements FormlyExtension {
  prePopulate(field: FormlyFieldConfig<FormlyFieldProps & { [additionalProperties: string]: any; }>): void {
    // Process options
    if (field.props?.options && !isObservable(field.props.options)) {
      field.props.options = of(this.processOptions(field.props));
    }
    // Process filter options
    if (field.props?.filters?.options && !isObservable(field.props.filters.options)) {
      field.props.filters.options = of(this.processOptions(field.props.filters));
    }
  }

  private processOptions(props: any): any[] {
    this.processUntranslatedLabel(props.options);
    const preferredOptions = props.options.filter((option: any) => option.preferred);
    if (preferredOptions.length > 0) {
      const options = [];
      props.group = true;
      const otherOptions = props.options.filter((option: any) => !option.preferred);
      options.push({
        label: 'group-preferred',
        untranslatedLabel: 'group-preferred',
        items: props.sort ? this.sortOptions(preferredOptions) : preferredOptions
      });
      options.push({
        label: 'group-other',
        untranslatedLabel: 'group-other',
        items: props.sort ? this.sortOptions(otherOptions) : otherOptions
      });
      return options;
    } else {

      return props.sort ? this.sortOptions(props.options) : props.options
    }
  }

  private processUntranslatedLabel(options: any[]): void {
    options.map((option: any) => {
      option.untranslatedLabel = option.label;
      if (option.items) {
        this.processUntranslatedLabel(option.items);
      }
      if (option.children) {
        this.processUntranslatedLabel(option.children);
      }
    });
  }

  private sortOptions(options: any) {
    options = options.sort((a: any, b: any) => a.label.localeCompare(b.label));
    if (options.filter((option: any) => option.items).length > 0) {
      options.forEach((option: any) => {
        if (option.items) {
          return this.sortOptions(option.items);
        }
      });
    }
    return options;
  }
}

/**
 * To register an ngx-formly translations extension.
 *
 * @param translate ngx-translate service
 * @param recordService - ng core record service
 * @returns FormlyConfig object configuration
 */
export function registerNgCoreFormlyExtension(translate: TranslateService, recordService: RecordService) {
  return {
    // translate the default validators messages
    // widely inspired from ngx-formly example
    validationMessages: [
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
        message: (_err, field: FormlyFieldConfig) => {
          const validatorConfig = field.props.customValidators.numberOfSpecificValuesInObject;
          const min = validatorConfig.min || 0;
          const max = validatorConfig.max || Infinity;
          const { keys } = validatorConfig;

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
        name: 'minLength',
        message: (_err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT be shorter than {{minLength}} characters'), {
            minLength: field.props.minLength,
          }),
      },
      {
        name: 'maxLength',
        message: (_err: any, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT be longer than {{maxLength}} characters'), {
            maxLength: field.props.maxLength,
          }),
      },
      {
        name: 'minItems',
        message: (_err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT have fewer than {{minItems}} items'), {
            minItems: field.props.minItems,
          }),
      },
      {
        name: 'maxItems',
        message: (_err: any, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT have more than {{maxItems}} items'), {
            maxItems: field.props.maxItems,
          }),
      },
      {
        name: 'min',
        message: (_err: any, field: FormlyFieldConfig) =>
          translate.stream(_('should be >=  {{min}}'), { min: field.props.min }),
      },
      {
        name: 'max',
        message: (_err: any, field: FormlyFieldConfig) =>
          translate.stream(_('should be <=  {{max}}'), { max: field.props.max }),
      },
      {
        name: 'exclusiveMinimum',
        message: (_err: any, field: FormlyFieldConfig) =>
          translate.stream(_('should be >  {{step}}'), { step: field.props.step }),
      },
      {
        name: 'exclusiveMaximum',
        message: (_err: any, field: FormlyFieldConfig) =>
          translate.stream(_('should be <  {{step}}'), { step: field.props.step }),
      },
      {
        name: 'multipleOf',
        message: (_err: any, field: FormlyFieldConfig) =>
          translate.stream(_('should be multiple of ${{step}}'), { step: field.props.step }),
      },
      {
        name: 'const',
        message: (_err: any, field: FormlyFieldConfig) =>
          translate.stream(_('should be equal to constant "{{const}}"'), { const: field.props.const }),
      },
    ],
    extensions: [
      {
        name: 'form-options',
        extension: new FormOptionsProcessExtension(),
        priority: 12
      },
      {
        name: 'translate',
        extension: new TranslateExtension(),
        // Execute Translate extension after ng-core extension
        priority: 11,
      },
      {
        name: 'ng-core',
        extension: new NgCoreFormlyExtension(),
        // Execute Core Formly extension after formly processing (priority low)
        // https://main.formly.dev/docs/guide/custom-formly-extension#extension-priority
        priority: 10,
      },
    ],
  };
}
