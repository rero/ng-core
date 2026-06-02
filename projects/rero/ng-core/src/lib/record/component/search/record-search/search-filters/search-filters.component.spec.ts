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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { RecordSearchStore } from '../../store/record-search.store';
import { SearchFiltersComponent } from './search-filters.component';

describe('SearchFiltersComponent', () => {
  let component: SearchFiltersComponent;
  let fixture: ComponentFixture<SearchFiltersComponent>;
  let store: InstanceType<typeof RecordSearchStore>;

  const typeConfig = {
    key: 'documents',
    label: 'documents',
    allowEmptySearch: false,
    searchFilters: [
      { label: 'Expert search', filter: 'simple', value: '0', disabledValue: 1, persistent: true },
      {
        filters: [
          { label: 'Online resources', filter: 'online', value: 'true', showIfQuery: true },
          { label: 'Physical resources', filter: 'not_online', value: 'true', showIfQuery: true },
        ],
        label: 'show only',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ToggleSwitchModule,
        TranslateModule.forRoot(),
        RouterModule.forRoot([]),
        SearchFiltersComponent,
      ],
      providers: [RecordSearchStore, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();

    store = TestBed.inject(RecordSearchStore);
    store.updateRouteConfig({ types: [typeConfig as any] });
    store.setCurrentType('documents');

    fixture = TestBed.createComponent(SearchFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should only display the expert search when query is empty', () => {
    const inputs = fixture.debugElement.nativeElement.querySelectorAll('p-toggleswitch');
    expect(inputs.length).toBe(1);
  });

  it('should display all filters if there is a query', () => {
    store.updateQuery('*');
    fixture.detectChanges();
    const inputs = fixture.debugElement.nativeElement.querySelectorAll('p-toggleswitch');
    expect(inputs.length).toBe(3);

    const labels = fixture.debugElement.nativeElement.querySelectorAll('label');
    expect(labels[0].innerHTML).toEqual('Expert search');
    expect(labels[1].innerHTML).toEqual('Online resources');
    expect(labels[2].innerHTML).toEqual('Physical resources');
  });

  it('should display section label when styleClassSection is set', () => {
    store.updateQuery('*');
    fixture.componentRef.setInput('styleClassSection', 'font-bold');
    fixture.detectChanges();

    const span = fixture.debugElement.nativeElement.querySelector('div.font-bold');
    expect(span.innerHTML).toEqual('show only');
  });

  it('should update the store when a switch is activated', () => {
    store.updateQuery('*');
    fixture.detectChanges();
    const inputs = fixture.debugElement.nativeElement.querySelectorAll('p-toggleswitch');
    inputs[1].querySelector('div').click();
    const onlineFilter = store.aggregationsFilters().find((f: any) => f.key === 'online');
    expect(onlineFilter?.values).toContain('true');
  });
});
