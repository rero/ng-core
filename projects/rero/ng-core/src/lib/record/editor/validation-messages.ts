/*
* Invenio angular core
* Copyright (C) 2019 RERO
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

import { FormlyFieldConfig } from '@ngx-formly/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export function minItemsValidationMessage(err, field: FormlyFieldConfig) {
  return _(`should NOT have fewer than ${field.templateOptions.minItems} items`);
}

export function maxItemsValidationMessage(err, field: FormlyFieldConfig) {
  return _(`should NOT have more than ${field.templateOptions.maxItems} items`);
}

export function minlengthValidationMessage(err, field: FormlyFieldConfig) {
  return _(`should NOT be shorter than ${field.templateOptions.minLength} characters`);
}

export function maxlengthValidationMessage(err, field: FormlyFieldConfig) {
  return _(`should NOT be longer than ${field.templateOptions.maxLength} characters`);
}

export function minValidationMessage(err, field: FormlyFieldConfig) {
  return _(`should be >= ${field.templateOptions.min}`);
}

export function maxValidationMessage(err, field: FormlyFieldConfig) {
  return _(`should be <= ${field.templateOptions.max}`);
}

export function multipleOfValidationMessage(err, field: FormlyFieldConfig) {
  return _(`should be multiple of ${field.templateOptions.step}`);
}

export function exclusiveMinimumValidationMessage(
  err,
  field: FormlyFieldConfig
) {
  return _(`should be > ${field.templateOptions.step}`);
}

export function exclusiveMaximumValidationMessage(
  err,
  field: FormlyFieldConfig
) {
  return _(`should be < ${field.templateOptions.step}`);
}

export function constValidationMessage(err, field: FormlyFieldConfig) {
  return _(`should be equal to constant "${field.templateOptions.const}"`);
}
