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
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatorModule } from 'primeng/paginator';
import { ChangeEvent, PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;
  let fixture: ComponentFixture<PaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginatorComponent],
      imports: [PaginatorModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('totalRecords', 100);
    fixture.detectChanges();
  });

  it('should have the default settings', () => {
    expect(component.alwaysShow()).toBeTrue();
    expect(component.currentPage()).toEqual(1);
    expect(component.pageLinkSize()).toEqual(5);
    expect(component.rows()).toEqual(10);
    expect(component.rowsPerPageOptions()).toEqual(undefined);
    expect(component.showCurrentPageReport()).toBeFalse();
    expect(component.showFirstLastIcon()).toBeFalse();
    expect(component.totalRecords()).toEqual(100);
    expect(component.first()).toEqual(0);
  });

  it('should display the pagination with defined page link size', () => {
    let element: HTMLElement = fixture.nativeElement;
    const paginator = element.querySelector('p-paginator');
    expect(paginator).not.toEqual(null);
    let button = element.querySelector('.p-paginator-pages').querySelectorAll('button');
    expect(button.length).toEqual(5);

    fixture.componentRef.setInput('pageLinkSize', 10);
    fixture.detectChanges();

    element: HTMLElement = fixture.nativeElement;
    button = element.querySelector('.p-paginator-pages').querySelectorAll('button');
    expect(button.length).toEqual(10);
  });

  it('should display text information from pages', () => {
    fixture.componentRef.setInput('showCurrentPageReport', true);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const info = element.querySelector('.p-paginator-current');
    expect(info.textContent).toEqual('1 of 10');
  });

  it('should display text information from pages', () => {
    fixture.componentRef.setInput('rowsPerPageOptions', [10,20,30,50]);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const dropdown = element.querySelector('p-dropdown');
    expect(dropdown).not.toEqual(null);
  });

  it('should contain the new values on the page change click', () => {
    let $subscribe = component.rowPageChange.subscribe((event: ChangeEvent) => {
      expect(event).toEqual({'rows': 10, 'page': 1});
    });
    let btn = fixture.debugElement.nativeElement.querySelectorAll('.p-paginator-element')[2];
    btn.click();
    $subscribe.unsubscribe();

    $subscribe = component.rowPageChange.subscribe((event: ChangeEvent) => {
      expect(event).toEqual({'rows': 10, 'page': 3});
    });
    btn = fixture.debugElement.nativeElement.querySelectorAll('.p-paginator-element')[4];
    btn.click();
    $subscribe.unsubscribe();
  });
});
