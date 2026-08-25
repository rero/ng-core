// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { AbstractUnsavedChangesComponent } from '../component/abstract-unsaved-changes/abstract-unsaved-changes.component';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { DialogComponent } from '../component/dialog/dialog.component';

/**
 * When this guard is configured, it intercepts the form output without
 * saving or undoing changes, and displays a confirmation modal.
 *
 * Route definition configuration
 * { path: 'foo/bar', canDeactivate: [unsavedChangesGuard] },
 *
 * Custom editor component configuration
 * class FooComponent extends AbstractUnsavedChangesComponent {
 *  canDeactivate: boolean = false;
 *  ...
 * }
 *
 * Template configuration (add output canDeactivateChange)
 * <ng-core-editor
 *   (canDeactivateChange)="canDeactivateChanged($event)"
 *   ...
 * ></ng-core-editor>
 */
export const unsavedChangesGuard: CanDeactivateFn<AbstractUnsavedChangesComponent> = (component) => {
  if (component.canDeactivate) {
    return true;
  }

  const translateService = inject(TranslateService);
  const ref = inject(DialogService).open(DialogComponent, {
    header: translateService.instant('Quit the page'),
    data: {
      body: translateService.instant('Do you want to quit the page? The changes made so far will be lost.'),
      confirmButton: true,
      confirmTitleButton: translateService.instant('Quit'),
      cancelTitleButton: translateService.instant('Stay'),
    },
    dismissableMask: true,
    modal: true,
    style: { width: '25rem' },
  });

  return ref?.onClose ?? true;
};
