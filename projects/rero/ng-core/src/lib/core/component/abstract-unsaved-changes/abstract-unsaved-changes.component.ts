// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Directive } from '@angular/core';

/**
 * Base class for routed components that must confirm before leaving with
 * unsaved changes. Pair it with `unsavedChangesGuard` on the route.
 *
 * Doc: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
 *
 * The beforeunload event is fired when the window, the document and its resources
 * are about to be unloaded. The document is still visible and the event is still
 * cancelable at this point.
 */
@Directive({
  host: {
    '(window:beforeunload)': 'unloadNotification($event)',
  },
})
export abstract class AbstractUnsavedChangesComponent {
  abstract canDeactivate: boolean;

  unloadNotification($event: BeforeUnloadEvent): void {
    if (!this.canDeactivate) {
      $event.preventDefault();
    }
  }

  /**
   * Can deactivate changed on editor
   * @param activate - boolean
   */
  canDeactivateChanged(activate: boolean): void {
    this.canDeactivate = activate;
  }
}
