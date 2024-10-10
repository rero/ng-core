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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabViewModule } from 'primeng/tabview';
import { SearchTabsComponent } from './search-tabs.component';

// TODO: Fix this test after migrate to v18.

// describe('SearchTabsComponent', () => {
//   let component: SearchTabsComponent;
//   let fixture: ComponentFixture<SearchTabsComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       declarations: [SearchTabsComponent],
//       imports: [
//         TabViewModule,
//         NoopAnimationsModule,
//         RouterModule.forRoot([]),
//         TranslateModule.forRoot()
//       ]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(SearchTabsComponent);
//     component = fixture.componentInstance;
//     fixture.componentRef.setInput('types', [
//       { key: 'document', label: 'document' },
//       { key: 'organisation', 'label': 'organisation' },
//     ]);
//     fixture.whenStable();
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('Should display tabs', () => {
//     const tabView = fixture.debugElement.nativeElement.querySelector('p-tabView');
//     expect(tabView).toHaveSize(1);
//   });

//   it('should emit an event on the click of the tab', () => {
//     component.onChangeType.subscribe((type: string) => {
//       expect(type).toEqual('organisation');
//     });
//     const tabPanel = fixture.debugElement.nativeElement.querySelectorAll('ul > li')[1].querySelector('span');
//     tabPanel.click();
//   });
// });
