// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';

/**
 * Component for displaying an object in editor.
 */
@Component({
  selector: 'ng-core-editor-formly-object',
  templateUrl: './object.component.html',
  imports: [FormlyModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectComponent extends FieldType<FieldTypeConfig> {
  defaultOptions: Partial<FieldTypeConfig> = {
    props: {
      containerCssClass: 'core:flex core:flex-col core:gap-2',
    },
  };
}
