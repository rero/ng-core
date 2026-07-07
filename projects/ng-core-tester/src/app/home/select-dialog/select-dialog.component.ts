// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectDialogFormComponent } from './select-dialog-form.component';

/**
 * Example: open a DynamicDialog (as ng-core's LoadTemplateFormComponent does)
 * containing a `select` field with `autofocus`. Options load asynchronously
 * after the dialog is open, and the panel then opens automatically.
 */
@Component({
  selector: 'app-select-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-dialog.component.html',
  imports: [Button, TranslatePipe],
  providers: [DialogService],
})
export class SelectDialogComponent {
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslateService);

  open(): void {
    this.dialogService.open(SelectDialogFormComponent, {
      header: this.translateService.instant('Select with autofocus'),
      modal: true,
      width: '25rem',
    });
  }
}
