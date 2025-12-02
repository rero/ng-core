/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PaginatorModule } from 'primeng/paginator';
import { RecordSearchStore } from '../../store/record-search.store';
import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;
  let fixture: ComponentFixture<PaginatorComponent>;
  let store: InstanceType<typeof RecordSearchStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatorModule, PaginatorComponent, TranslateModule.forRoot()],
      providers: [RecordSearchStore, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();

    store = TestBed.inject(RecordSearchStore);
    store.setResults({ hits: { total: { value: 100, relation: 'eq' }, hits: [] } } as any);

    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have the default settings', () => {
    expect(component.alwaysShow()).toBe(true);
    expect(component.currentPage()).toEqual(1);
    expect(component.pageLinkSize()).toEqual(5);
    expect(component.rows()).toEqual(10);
    expect(component.rowsPerPageOptions()).toEqual([10, 25, 50, 100]);
    expect(component.showCurrentPageReport()).toBe(true);
    expect(component.showFirstLastIcon()).toBe(true);
    expect(component.totalRecords()).toEqual(100);
    expect(component.first()).toEqual(0);
  });

  it('should display the pagination with defined page link size', () => {
    const element: HTMLElement = fixture.nativeElement;
    const paginator = element.querySelector('p-paginator');
    expect(paginator).not.toEqual(null);
    let button = element.querySelector('.p-paginator-pages')!.querySelectorAll('button');
    expect(button.length).toEqual(5);

    store.updateRouteConfig({
      types: [
        {
          key: 'documents',
          label: 'Documents',
          pagination: { boundaryLinks: true, maxSize: 10, pageReport: true, rowsPerPageOptions: [10, 25, 50, 100] },
        } as any,
      ],
    });
    store.setCurrentType('documents');
    fixture.detectChanges();

    button = element.querySelector('.p-paginator-pages')!.querySelectorAll('button');
    expect(button.length).toEqual(10);
  });

  it('should display text information from pages', () => {
    const element: HTMLElement = fixture.nativeElement;
    const info = element.querySelector('.p-paginator-current');
    expect(info!.textContent).toEqual('1 of 10');
  });

  it('should display the rows per page dropdown', () => {
    const element: HTMLElement = fixture.nativeElement;
    const dropdown = element.querySelector('p-select');
    expect(dropdown).not.toEqual(null);
  });

  it('should update the store on page change click', () => {
    const btn = fixture.debugElement.nativeElement.querySelectorAll('.p-paginator-page')[1];
    btn.click();
    fixture.detectChanges();
    expect(store.page()).toEqual(2);
  });

  it("should recalculate the pager's position", () => {
    expect(component.first()).toEqual(0);
    store.updatePage(3);
    expect(component.first()).toEqual(20);

    store.updateSize(20);
    expect(component.first()).toEqual(40);
  });
});
