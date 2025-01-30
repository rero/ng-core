/*
 * RERO angular core
 * Copyright (C) 2024-2025 RERO
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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuSortComponent } from './menu-sort.component';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ComponentRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

describe('MenuSortComponent', () => {
  let component: MenuSortComponent;
  let componentRef: ComponentRef<MenuSortComponent>;
  let fixture: ComponentFixture<MenuSortComponent>;

  const MenuItems: MenuItem[] = [
    { label: "Pertinence", value: "pertinence" }
  ];

  const MenuItemsOrder: MenuItem[] = [
    { label: "Date start", value: "date_start" },
    { label: "Date end", value: "date_end" },
    { label: "Available", value: "available"}
  ];

  const activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  activatedRouteMock.snapshot.and.returnValue({queryParamMap: { params: { sort: 'pertinence' }}});

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [MenuSortComponent],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        DropdownModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        MenuModule,
        ButtonModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuSortComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('config', MenuItems);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have values in the inputs', () => {
    expect(component.config()).toEqual(MenuItems);
    expect(component.selectedOption()).toBeUndefined();
    expect(component.options()[0].command).not.toBeNull();
  });

  it('should not display the menu', () => {
    componentRef.setInput('config', []);
    fixture.detectChanges();
    const dropdown = fixture.debugElement.nativeElement.querySelector('p-menu');
    expect(dropdown).toBeNull();
  });

  it('should display the menu', () => {
    const dropdown = fixture.debugElement.nativeElement.querySelector('p-menu');
    expect(dropdown).not.toBeNull();
  });

  it('should return the value selected by default', () => {
    componentRef.setInput('selectedValue', 'pertinence');
    fixture.detectChanges();
    expect(component.selectedOption().label).toEqual('Pertinence');
  });

  it('should return the sorted values', () => {
    componentRef.setInput('config', MenuItemsOrder);
    fixture.detectChanges();
    expect(component.options()[0].value).toEqual('available');
    expect(component.options()[1].value).toEqual('date_end');
    expect(component.options()[2].value).toEqual('date_start');
  });
});
