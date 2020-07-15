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
import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import sha256 from 'crypto-js/sha256';

/**
 * Add onPopulate hook at the field level.
 *
 * This is a function because of https://github.com/ngx-formly/ngx-formly/issues/1624.
 * @param field formly field config
 */
export function onPopulateHook(field: FormlyFieldConfig) {
  if (field.hooks && field.hooks.onPopulate) {
    field.hooks.onPopulate(field);
  }
}


export const hooksFormlyExtension: FormlyExtension = {

  /**
   * Call the corresponding field hook.
   *
   * Apply when the DefaultOptions, Model, formControl are set (which is suitable to update the child element).
   * See: https://github.com/ngx-formly/ngx-formly/issues/1109 for more detail.
   * @param field formly field config
   */
  onPopulate: onPopulateHook
};


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

    const options: any = {
    };
    // label / title
    if (to.label) {
      options.label = this._translate.stream(to.label);
      field.expressionProperties = {
        ...(field.expressionProperties || {}),
        'templateOptions.label': this._translate.stream(to.label),
      };
    }
    // description
    if (to.description) {
      options.description = this._translate.stream(to.description);
      field.expressionProperties = {
        ...(field.expressionProperties || {}),
        'templateOptions.description': this._translate.stream(to.description),
      };
    }
    // placeholder
    if (to.placeholder) {
      options.placeholder = this._translate.stream(to.placeholder);
      field.expressionProperties = {
        ...(field.expressionProperties || {}),
        'templateOptions.placeholder': this._translate.stream(to.placeholder),
      };
    }
    // Select options
    if (to.options) {
      const key = sha256(JSON.stringify(to)).toString();
      this._optionsMap.set(key, to.options);
      const bs = new BehaviorSubject(this._translateOptions(to.options));
      this._translate.onLangChange.subscribe(() => {
        bs.next(this._translateOptions(this._optionsMap.get(key)));
      });
      field.expressionProperties = {
        ...(field.expressionProperties || {}),
        'templateOptions.options': bs.asObservable(),
      };
    }
  }

  /**
   * Translate select options
   * @param options - array of object
   */
  private _translateOptions(options: any) {
    const selectOptions = [];
    options.forEach((element: any) => {
      selectOptions.push({
        label: this._translate.instant(element.label),
        value: element.value
      });
    });

    return selectOptions;
  }
}

/**
 * To register an ngx-formly translations extension.
 *
 * @param translate ngx-translate service
 * @returns FormlyConfig object configuration
 */
export function registerTranslateExtension(translate: TranslateService) {
  return {
    // translate the default validators messages
    // widely inspired from ngx-formly example
    validationMessages: [
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
    }],
  };
}
