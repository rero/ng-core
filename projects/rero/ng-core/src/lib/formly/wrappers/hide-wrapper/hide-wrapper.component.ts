// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'ng-core-hide-wrapper',
  // do not include the children
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HideWrapperComponent extends FieldWrapper {}
