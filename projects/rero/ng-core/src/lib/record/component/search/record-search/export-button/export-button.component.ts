// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonDirective, Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Menu } from 'primeng/menu';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportButtonComponent {
  /** Export formats configuration */
  exportOptions = input.required<IExportOption[]>();

  openLink(url: string): void {
    window.location.href = url;
  }
}
