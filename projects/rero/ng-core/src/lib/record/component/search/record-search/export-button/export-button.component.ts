// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, input } from '@angular/core';
import { ButtonDirective, Button } from '@openng/optimus-ui/button';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Menu } from '@openng/optimus-ui/menu';
import { TranslatePipe } from '@ngx-translate/core';

export interface IExportOption {
  label: string;
  url: string;
  disabled?: boolean;
  disabled_message?: string;
}

@Component({
  selector: 'ng-core-export-button',
  templateUrl: './export-button.component.html',
  imports: [ButtonDirective, Button, Tooltip, Menu, TranslatePipe],
})
export class ExportButtonComponent {
  /** Export formats configuration */
  exportOptions = input.required<IExportOption[]>();

  openLink(url: string): void {
    window.location.href = url;
  }
}
