// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AbstractControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

export function emailValidator(field: FormlyFieldConfig) {
  // Regex pattern to check email
  const emailPattern = /^([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})$/;
  if (field.props?.type !== 'email' || field.validators?.email) {
    return;
  }

  field.validators = field.validators || {};
  field.validators.email = {
    expression: (control: AbstractControl) => (control.value ? new RegExp(emailPattern).test(control.value) : true),
    message: `This value is not a valid email.`,
  };
}
