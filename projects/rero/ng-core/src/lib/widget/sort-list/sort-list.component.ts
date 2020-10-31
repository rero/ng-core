/*
 * RERO angular core
 * Copyright (C) 2020 RERO
 * Copyright (C) 2020 UCLouvain
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
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ng-core-sort-list',
  templateUrl: './sort-list.component.html'
})
export class SortListComponent implements OnInit {

  /** options to use for into the select */
  @Input() options: Array<{value: string, label?: string, icon?: string}> = [];
  /** Is the option icon should be used */
  @Input() useIcon = false;
  /** Event emitted when an option is selected */
  @Output() selectChange = new EventEmitter<string>();

  /** the current used icon */
  currentIcon: string;

  /**
   * OnInit hook
   */
  ngOnInit() {
    if (this.options.length) {
      this.currentIcon = this._getIcon(this.options[0]);
    }
  }

  /**
   * Function called when an option is selected.
   * This function emit the 'selectChange' output event.
   * @param value: the selected option value
   */
  selectingSortCriteria(value: string) {
    const selectedOption = this.options.find(option => option.value === value);
    this.currentIcon = this._getIcon(selectedOption);
    this.selectChange.emit(value);
  }

  /**
   * Get the icon related to an option. If no icon are defined, return a default icon
   * @param option: the option
   * @return the icon related to the option
   */
  private _getIcon(option: {value: string, label?: string, icon?: string}): string {
    return option.icon || 'fa-question';
  }

}
