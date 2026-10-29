// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, input } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Tooltip } from '@openng/optimus-ui/tooltip';

/**
 * Component for displaying a label with dropdown in editor.
 */
@Component({
  selector: 'ng-core-editor-dropdown-label-editor',
  templateUrl: './dropdown-label-editor.component.html',
  imports: [Tooltip],
})
export class DropdownLabelEditorComponent {
  // current form field configuration
  readonly field = input.required<FormlyFieldConfig>();

  // can we add a new element to the related array
  readonly canAdd = input.required<boolean>();
}
