/*
 * RERO angular core
 * Copyright (C) 2022-2024 RERO
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
import { AbstractControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

export function emailValidator(field: FormlyFieldConfig) {
  // Regex pattern to check email
  const emailPattern = /^([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})$/;
  if ( field.props?.type !== 'email' || field.validators?.email) {
    return;
  }

  field.validators = field.validators || {};
  field.validators.email = {
    expression: (control: AbstractControl) => control.value ? (new RegExp(emailPattern)).test(control.value) : true,
    message: `This value is not a valid email.`,
  };
}
