/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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

@Component({
  selector: 'ng-core-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  @Input()
  menu;

  @Input()
  isItemMenuVisible: (menuItem) => true;

  @Output() clickItem = new EventEmitter<object>();

  itemType(item) {
    if (item.routerLink) {
      return 'routerLink';
    }
    if (item.href) {
      return 'href';
    }
    return 'action';
  }

  itemClass(item) {
    const itemClasses = [
      this.menu.hasOwnProperty('itemCssClass') ? this.menu.itemCssClass : 'nav-item'
    ];
    if (item.active) {
      itemClasses.push(item.hasOwnProperty('cssActiveClass') ? item.cssActiveClass : 'active');
    }
    return itemClasses.join(' ');
  }

  doClickItem(event, item) {
    event.preventDefault();
    this.clickItem.emit(item);
  }
}
