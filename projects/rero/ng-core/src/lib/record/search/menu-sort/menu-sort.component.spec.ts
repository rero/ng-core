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
import { MenuSortComponent } from './menu-sort.component';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ComponentRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SearchSortComponent', () => {
  let component: MenuSortComponent;
  let componentRef: ComponentRef<MenuSortComponent>;
  let fixture: ComponentFixture<MenuSortComponent>;

  const config = {
    sortOptions: [
      { label: "Pertinence", value: "pertinence" }
    ]
  };

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
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuSortComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have values in the inputs', () => {
    expect(component.config()).toEqual(config);
    expect(component.sortParamName()).toEqual('sort');
  });

  it('should not display the menu', () => {
    componentRef.setInput('config', { sortOptions: []});
    fixture.detectChanges();
    const dropdown = fixture.debugElement.nativeElement.querySelector('p-dropdown');
    expect(dropdown).toBeNull();
  });

  it('should display the menu', () => {
    const dropdown = fixture.debugElement.nativeElement.querySelector('p-dropdown');
    expect(dropdown).not.toBeNull();
    const span = dropdown.querySelector('.p-element');
    span.click();
    const dropdownItemLi = fixture.debugElement.nativeElement.querySelectorAll('p-dropdownitem > li');
    expect(dropdownItemLi[0].querySelector('span').innerHTML).toEqual('Pertinence');
  });
});
