/*
 * RERO angular core
 * Copyright (C) 2023-2024 RERO
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
import { inject, Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AbstractCanDeactivateComponent } from '../component/abstract-can-deactivate.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogComponent } from '../dialog/dialog.component';

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

  translateService = inject(TranslateService);
  dialogService = inject(DialogService);

  ref: DynamicDialogRef | undefined;

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
            body: this.translateService.instant(
              'Do you want to quit the page? The changes made so far will be lost.'
            ),
            confirmButton: true,
            confirmTitleButton: this.translateService.instant('Quit'),
            cancelTitleButton: this.translateService.instant('Stay'),
          },
          dismissableMask: true,
          modal: true,
          style: { width: '25rem' }
        });

        return this.ref.onClose;
      }

      return true;
  }
}
