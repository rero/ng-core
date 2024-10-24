/*
 * RERO angular core
 * Copyright (C) 2024 RERO
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
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SearchField } from '../../record';
import { SearchFieldsComponent } from './search-fields.component';

// TODO: Fix this test after migrate to v18.

// describe('SearchFieldsComponent', () => {
//   let component: SearchFieldsComponent;
//   let componentRef: ComponentRef<SearchFieldsComponent>;
//   let fixture: ComponentFixture<SearchFieldsComponent>;

//   const searchFields: SearchField[] = [
//     { label: 'first', path: 'first', selected: false },
//     { label: 'second', path: 'second', selected: false },
//   ];

//   beforeEach(async () => {
//     TestBed.configureTestingModule({
//       declarations: [SearchFieldsComponent],
//       imports: [
//         BrowserAnimationsModule,
//         SplitButtonModule,
//         TranslateModule.forRoot(),
//         RouterModule.forRoot([])
//       ]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(SearchFieldsComponent);
//     component = fixture.componentInstance;
//     componentRef = fixture.componentRef;
//     componentRef.setInput('searchFields', searchFields);
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should display the menu with the default label', () => {
//     fixture.detectChanges();
//     const buttonLabel = fixture.debugElement.nativeElement.querySelector('p-splitButton button > span');
//     expect(buttonLabel.innerHTML).toEqual('Search in …');
//   });

//   it('should display the menu with the specified label', () => {
//     const label = 'Search field';
//     componentRef.setInput('searchLabel', label);
//     fixture.detectChanges();
//     const buttonLabel = fixture.debugElement.nativeElement.querySelector('p-splitButton button > span');
//     expect(buttonLabel.innerHTML).toEqual(label + ' …');
//   });

//   it('should display the menu with the filter fields', () => {
//     fixture.detectChanges();
//     const button = fixture.debugElement.nativeElement.querySelector('.p-splitbutton-menubutton');
//     button.click();
//     fixture.detectChanges();
//     const menuItems = fixture.debugElement.nativeElement.querySelectorAll('li.p-menuitem span');
//     expect(menuItems.length).toEqual(3);
//     expect(menuItems[0].innerHTML).toEqual('first');
//     expect(menuItems[1].innerHTML).toEqual('second');
//     expect(menuItems[2].innerHTML).toEqual('Reset');
//   });

//   it('should display the menu with the reset mode label change', () => {
//     const label = 'My reset';
//     componentRef.setInput('resetLabel', label);
//     fixture.detectChanges();
//     const button = fixture.debugElement.nativeElement.querySelector('.p-splitbutton-menubutton');
//     button.click();
//     fixture.detectChanges();
//     const menuItems = fixture.debugElement.nativeElement.querySelectorAll('li.p-menuitem span');
//     expect(menuItems[2].innerHTML).toEqual(label);
//   });

//   it('should not display the reset option in the menu', () => {
//     componentRef.setInput('withResetAction',false);
//     fixture.detectChanges();
//     const button = fixture.debugElement.nativeElement.querySelector('.p-splitbutton-menubutton');
//     button.click();
//     fixture.detectChanges();
//     const menuItems = fixture.debugElement.nativeElement.querySelectorAll('li.p-menuitem span');
//     expect(menuItems.length).toEqual(2);
//   });
// });
