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
import { inject, Injectable } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { RecordData } from '../../../../model';
import { ApiService } from '../../../service/api/api.service';
import { RecordService } from '../../../service/record/record.service';
import { JSONSchema7 } from '../../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class JSONSchemaService {
  protected translateService: TranslateService = inject(TranslateService);
  protected recordService: RecordService = inject(RecordService);
  protected apiService: ApiService = inject(ApiService);

  processField(field: FormlyFieldConfig, jsonSchema: JSONSchema7) {
    // initial population of arrays with a minItems constraints
    if (field.type === 'array' && jsonSchema.minItems && !Object.hasOwn(jsonSchema, 'default')) {
      field.defaultValue = new Array(jsonSchema.minItems);
    }
    // If 'format' is defined into the jsonSchema, use it as props to try a validation on this field.
    // See: `email.validator.ts` file
    if (jsonSchema.format) {
      if (!field.props) {
        field.props = {};
      }
      field.props.type = jsonSchema.format;
    }

    if (jsonSchema?.widget?.formlyConfig) {
      const { props } = jsonSchema.widget.formlyConfig;

      if (props) {
        this.setSimpleOptions(field);
        this.setValidation(field, props);
        this.setRemoteSelectOptions(field, props);
      }
    }

    return field;
  }

  /**
   * Populate a select options with a remote API call.
   * @param field formly field config
   * @param formOptions JSONSchema object
   */
  protected setRemoteSelectOptions(field: FormlyFieldConfig, formOptions: any): void {
    if (formOptions.remoteOptions && formOptions.remoteOptions.type) {
      field.type = 'select';
      field.hooks = {
        ...field.hooks,
        afterContentInit: (f: FormlyFieldConfig) => {
          const recordType = formOptions.remoteOptions.type;
          const query = formOptions.remoteOptions.query || '';
          if (!f.props) {
            f.props = {};
          }
          f.props.options = this.recordService
            .getRecords(recordType, { query, itemsPerPage: RecordService.MAX_REST_RESULTS_SIZE })
            .pipe(
              map((data) => {
                if (data.hits.hits) {
                  return data.hits.hits.map((record: RecordData) => {
                    return {
                      label:
                        formOptions.remoteOptions.labelField && formOptions.remoteOptions.labelField in record.metadata
                          ? record.metadata[formOptions.remoteOptions.labelField]
                          : record.metadata.name,
                      value: this.apiService.getRefEndpoint(recordType, record.id),
                    };
                  });
                } else {
                  return [];
                }
              }),
            );
        },
      };
    }
  }

  /**
   *
   * @param field formly field config
   * @param formOptions JSONSchema object
   */
  protected setValidation(field: FormlyFieldConfig, formOptions: any): void {
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
          field.validation.messages[key.replace(/Message$/, '')] = () =>
            // translate the validation messages coming from the JSONSchema
            this.translateService.stream(msg);
        }
      }

      if (formOptions.validation.validators) {
        // validators: add validator with expressions
        // TODO: use widget
        const validatorsKey = Object.keys(formOptions.validation.validators);
        validatorsKey.map((validatorKey) => {
          const validator = formOptions.validation.validators[validatorKey];
          if ('expression' in validator && 'message' in validator) {
            const { expression } = validator;
            const expressionFn = Function('formControl', `return ${expression};`);
            const validatorExpression = {
              expression: (fc: UntypedFormControl) => expressionFn(fc),
              // translate the validation message coming form the JSONSchema
              message: this.translateService.stream(validator.message),
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
  protected setSimpleOptions(field: FormlyFieldConfig): void {
    // some fields should not submit the form when enter key is pressed
    if (field.props?.doNotSubmitOnEnter != null) {
      field.props.keydown = (_f: FormlyFieldConfig, event?: any) => {
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      };
    }
  }
}
