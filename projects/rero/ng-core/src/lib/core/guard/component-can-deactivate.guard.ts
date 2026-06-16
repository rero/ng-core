// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AbstractCanDeactivateComponent } from '../component/abstract-can-deactivate/abstract-can-deactivate.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogComponent } from '../component/dialog/dialog.component';

/**
 * When this guard is configured, it intercepts the form output without
 * saving or undoing changes.
 *
 * Route definition configuration
 * { path: 'foo/bar', canDeactivate: [ ComponentCanDeactivateGuard ] },
 *
 * Custom editor component configuration
 * class FooComponent AbstractCanDeactivateComponent {
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

@Injectable()
export class ComponentCanDeactivateGuard {
  protected translateService: TranslateService = inject(TranslateService);
  protected dialogService: DialogService = inject(DialogService);

  ref: DynamicDialogRef<DialogComponent> | null = null;

  /**
   * Displays a confirmation modal if the user leaves the form without
   * saving or canceling
   * @param component - AbstractCanDeactivateComponent
   * @returns Observable<boolean> or boolean
   */
  canDeactivate(component: AbstractCanDeactivateComponent): Observable<boolean> | boolean {
    if (!component.canDeactivate) {
      this.ref = this.dialogService.open(DialogComponent, {
        header: this.translateService.instant('Quit the page'),
        data: {
          body: this.translateService.instant('Do you want to quit the page? The changes made so far will be lost.'),
          confirmButton: true,
          confirmTitleButton: this.translateService.instant('Quit'),
          cancelTitleButton: this.translateService.instant('Stay'),
        },
        dismissableMask: true,
        modal: true,
        style: { width: '25rem' },
      });

      return this.ref?.onClose || true;
    }

    return true;
  }
}
