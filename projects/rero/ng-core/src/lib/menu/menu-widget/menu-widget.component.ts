/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MenuItemInterface } from '../menu-item-interface';
import { MenuItem } from '../menu-item';

@Component({
  selector: 'ng-core-menu-widget',
  templateUrl: './menu-widget.component.html'
})
export class MenuWidgetComponent {

  /** Menu items */
  @Input() menu: MenuItemInterface;

  /** Event */
  @Output() clickItem = new EventEmitter();

  /**
   * Emit a event on click item menu
   * @param item - MenuItem
   */
  doClick(item: MenuItem | MenuItemInterface) {
    this.clickItem.emit(item);
  }
}
