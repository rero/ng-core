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
