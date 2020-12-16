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
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import sha256 from 'crypto-js/sha256';
import { BehaviorSubject, isObservable } from 'rxjs';
import { EditorService } from './services/editor.service';
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
  private _fieldWrapperTypes = [
    'boolean',
    'datepicker',
    'remoteTypeahead',
    'selectWithSort'
  ];

  /**
   * Constructor
   * @param _editorService - editor service
   */
  constructor(private _editorService: EditorService) { }

  /**
   * prePopulate Formly hook
   * @param field - FormlyFieldConfig
   */
  prePopulate(field: FormlyFieldConfig) {
    if (field.key) {
      field.id = this._getKey(field);
    }
  }

  /**
   * onPopulate Formly hook
   * @param field - FormlyFieldConfig
   */
  onPopulate(field: FormlyFieldConfig) {
    this._hideShowEmptyField(field);
    this._setWrappers(field);
    field.options.fieldChanges.subscribe(changes => {
      if (changes.type === 'expressionChanges' && changes.property === 'templateOptions.required' && changes.value === true) {
        if (changes.field.hide === true) {
          changes.field.hide = false;
        }
      }
    });
  }

  /**
   * Add formly wrappers
   * @param field - FormlyFieldConfig
   */
  private _setWrappers(field: FormlyFieldConfig) {

    // get wrappers from the templateOptions (JSONSchema)
    if (field.templateOptions) {
      field.wrappers = [
        ...(field.templateOptions.wrappers ? field.templateOptions.wrappers : []),
        ...(field.wrappers ? field.wrappers : [])
      ];
    }

    if (field.templateOptions && field.templateOptions.longMode === true) {
      // add automatically a card wrapper for the first level fields
      const parent = field.parent;
      if (parent && parent.templateOptions && parent.templateOptions.isRoot === true) {
        if (field.templateOptions.wrappers == null) {
          field.wrappers.push('card');
        }
      }
      // Add an horizontal wrapper for all given field types
      if (this._horizontalWrapperTypes.some(elem => elem === field.type)) {
        field.wrappers = field.wrappers.filter(w => w !== 'form-field');
        field.wrappers.push('form-field-horizontal');
      }
    }
    else {
      // adds form-fields for non standard field types
      if (this._fieldWrapperTypes.some(elem => elem === field.type)) {
        field.wrappers = [
          ...(field.wrappers ? field.wrappers : []),
          'form-field'
        ];
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
   * Hide or show field depending of the data content and the hide property
   * @param field - FormlyFieldConfig
   */
  private _hideShowEmptyField(field: FormlyFieldConfig) {
    let model = field.model;
    if (field.templateOptions == null) {
      return;
    }
    // for simple object the model is the parent dict
    if (
      field.model != null && !['object', 'multischema', 'array'].some(f => f === field.type)
    ) {
      // New from ngx-formly v5.9.0
      model = field.model[Array.isArray(field.key) ? field.key[0] : field.key];
    }
    model = removeEmptyValues(model);
    const modelEmpty = isEmpty(model);
    if (!modelEmpty && field.templateOptions.hide === true) {
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
}

export class TranslateExtension {

  /**
   * Constructor.
   *
   *  @param translate ngx-translate service
   */
  constructor(private _translate: TranslateService) { }

  /**
   * Options Map
   */
  private _optionsMap = new Map();

  /**
   * Translate some fields before populating the form.
   *
   * It translates the label, the description and the placeholder.
   * @param field formly field config
   */
  prePopulate(field: FormlyFieldConfig) {
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
        'templateOptions.label': this._translate.stream(to.label)
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
    // Select options
    if (to.options) {
      if (isObservable(to.options)) {
        to.options.subscribe((opts) => this._processOptions(field, to, opts));
      } else {
        this._processOptions(field, to, to.options);
      }
    }
  }

  /**
   * Translate the options of a select.
   *
   * @params field - ngx formly field
   * @params to - ngx formly templateOptions
   * @params options - ngx formly templateOptions.options
   */
  _processOptions(field: any, to: any, options: any) {
    const key = sha256(JSON.stringify(to)).toString();
    this._optionsMap.set(key, options);
    const bs = new BehaviorSubject(this._translateOptions(options));
    this._translate.onLangChange.subscribe(() => {
      bs.next(this._translateOptions(this._optionsMap.get(key)));
    });
    field.expressionProperties = {
      ...(field.expressionProperties || {}),
      'templateOptions.options': bs.asObservable(),
    };
  }

  /**
   * Translate select options
   * @param options - array of option object
   */
  private _translateOptions(options: any) {
    return options.map((option: any) => {
      option.label = (option.hasOwnProperty('label')) ? this._translate.instant(option.label) : option.value;
      return option;
    });
  }
}

/**
 * To register an ngx-formly translations extension.
 *
 * @param translate ngx-translate service
 * @returns FormlyConfig object configuration
 */
export function registerNgCoreFormlyExtension(translate: TranslateService, editorService: EditorService) {
  return {
    // translate the default validators messages
    // widely inspired from ngx-formly example
    validationMessages: [
      {
        name: 'formError',
        // use a marker to force translation extraction due to a bad detection of ngx-translate-extract
        message: () => translate.stream(_('The form contains errors.'))
      },
      {
        name: 'required',
        // use a marker to force translation extraction due to a bad detection of ngx-translate-extract
        message: () => translate.stream(_('This field is required'))
      },
      {
        name: 'null',
        message: () => translate.stream(_('should be null'))
      },
      {
        name: 'uniqueItems',
        message: () => translate.stream(_('should NOT have duplicate items'))
      },
      {
        name: 'uniqueValueKeysInObject',
        message: () => translate.stream(_('should NOT have duplicate items'))
      },
      {
        name: 'alreadyTaken',
        message: () => translate.stream(_('the value is already taken'))
      },
      {
        name: 'minlength',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT be shorter than {{minLength}} characters'), { minLength: field.templateOptions.minLength })
      },
      {
        name: 'maxlength',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT be longer than {{maxLength}} characters'), { maxLength: field.templateOptions.maxLength })
      },
      {
        name: 'minItems',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT have fewer than {{minItems}} items'), { minItems: field.templateOptions.minItems })
      },
      {
        name: 'maxItems',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should NOT have more than {{maxItems}} items'), { maxItems: field.templateOptions.maxItems })
      },
      {
        name: 'min',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be >=  {{min}}'), { min: field.templateOptions.min })
      },
      {
        name: 'max',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be <=  {{max}}'), { max: field.templateOptions.max })
      },
      {
        name: 'exclusiveMinimum',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be >  {{step}}'), { step: field.templateOptions.step })
      },
      {
        name: 'exclusiveMaximum',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be <  {{step}}'), { step: field.templateOptions.step })
      },
      {
        name: 'multipleOf',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be multiple of ${{step}}'), { step: field.templateOptions.step })
      },
      {
        name: 'const',
        message: (err, field: FormlyFieldConfig) =>
          translate.stream(_('should be equal to constant "{{const}}"'), { const: field.templateOptions.const })
      },
    ],
    extensions: [{
      name: 'translate',
      extension: new TranslateExtension(translate)
    }, {
      name: 'ng-core',
      extension: new NgCoreFormlyExtension(editorService)
    }],
  };
}
