/*
 * RERO angular core
 * Copyright (C) 2023 RERO
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
import {Component, HostListener} from "@angular/core";

/**
 * Doc: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
 *
 * The beforeunload event is fired when the window, the document and its resources
 * are about to be unloaded. The document is still visible and the event is still
 * cancelable at this point.
 */
@Component({ template: '' })
export abstract class AbstractCanDeactivateComponent {

  abstract canDeactivate: boolean;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
      if (!this.canDeactivate) {
          $event.returnValue = true;
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
