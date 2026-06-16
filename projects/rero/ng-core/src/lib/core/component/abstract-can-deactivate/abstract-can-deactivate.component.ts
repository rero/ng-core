// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, HostListener } from '@angular/core';

/**
 * Doc: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
 *
 * The beforeunload event is fired when the window, the document and its resources
 * are about to be unloaded. The document is still visible and the event is still
 * cancelable at this point.
 */
@Component({
  template: '',
})
export abstract class AbstractCanDeactivateComponent {
  abstract canDeactivate: boolean;

  @HostListener('window:beforeunload', ['$event'])
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
