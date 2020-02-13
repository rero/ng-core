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

import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core';


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
