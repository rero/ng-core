/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ng-core-menu',
  templateUrl: './menu.component.html'
})
export class MenuComponent {
  @Input() menu: any;

  @Input() isItemMenuVisible: (menuItem: any) => true;

  @Output() clickItem = new EventEmitter<object>();

  itemType(item: any) {
    if (item.routerLink) {
      return 'routerLink';
    }
    if (item.href) {
      return 'href';
    }
    if (item.name == null) {
      return 'divider';
    }
    return 'action';
  }

  itemClass(item: any) {
    const itemClasses = [
      this.menu.hasOwnProperty('itemCssClass') ? this.menu.itemCssClass : 'nav-item'
    ];
    if (item.active) {
      itemClasses.push(item.hasOwnProperty('cssActiveClass') ? item.cssActiveClass : 'active');
    }
    return itemClasses.join(' ');
  }

  doClickItem(event: any, item: any) {
    event.preventDefault();
    this.clickItem.emit(item);
  }

  /**
   * String used for `id=` in html menu result
   * @param item One element of the menu
   * @return item id parameter
   */
  getId(item: any) {
    if (item.id !== null) {
      return item.id;
    }
  }
}
