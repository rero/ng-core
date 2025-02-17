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
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { IChecked, SearchFiltersComponent } from './search-filters.component';

describe('SearchFiltersComponent', () => {
  let component: SearchFiltersComponent;
  let componentRef: ComponentRef<SearchFiltersComponent>;
  let fixture: ComponentFixture<SearchFiltersComponent>;
  let activatedRoute: ActivatedRoute;

  const searchFilters = [
    { label: "Expert search", filter: "simple", value: "0", disabledValue: "1", persistent: true },
    { filters: [
      { label: 'Online resources', filter: 'online', value: 'true', showIfQuery: true },
      { label: 'Physical resources', filter: 'not_online', value: 'true', showIfQuery: true }
    ], label: 'show only' }
  ];

  const config = {
    key: 'documents',
    label: 'documents',
    searchFilters: [
      { label: 'Expert search', filter: 'simple', value: '0', disabledValue: 1, persistent: true },
      { filters: [
        { label: 'Online resources', filter: 'online', value: 'true', showIfQuery: true },
        { label: 'Physical resources', filter: 'not_online', value: 'true', showIfQuery: true }
      ], label: 'show only' }
    ]
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [SearchFiltersComponent],
      imports: [
        FormsModule,
        ToggleSwitchModule,
        TranslateModule.forRoot(),
        RouterModule.forRoot([])
      ]
    })
    .compileComponents();

    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture = TestBed.createComponent(SearchFiltersComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('searchFilters', searchFilters);
    componentRef.setInput('config', config);
    componentRef.setInput('query', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should only display the expert search', () => {
    const inputs = fixture.debugElement.nativeElement.querySelectorAll('p-toggleswitch');
    expect(inputs.length).toBe(1);
  });

  it('should display all filters if there is a query', () => {
    componentRef.setInput('styleClassSection', 'font-bold');
    componentRef.setInput('query', '*');
    fixture.detectChanges();
    const inputs = fixture.debugElement.nativeElement.querySelectorAll('p-toggleswitch');
    expect(inputs.length).toBe(3);

    const labels = fixture.debugElement.nativeElement.querySelectorAll('label');
    expect(labels[0].innerHTML).toEqual('Expert search');
    expect(labels[1].innerHTML).toEqual('Online resources');
    expect(labels[2].innerHTML).toEqual('Physical resources');

    // Check section
    const div = fixture.debugElement.nativeElement.querySelector('div[class="core:mb-2"]');
    const span = div.querySelector('div.font-bold');
    expect(span.innerHTML).toEqual('show only');
  });

  it('should output a value when a switch is activated', () => {
    componentRef.setInput('query', '*');
    fixture.detectChanges();
    const event: IChecked = {
      filterKey: 'online',
      checked: true
    };
    const onChange = component.onChange.subscribe((change: IChecked) => {
      expect(change).toEqual(event);
    });
    const inputs = fixture.debugElement.nativeElement.querySelectorAll('p-toggleswitch');
    inputs[1].querySelector('div').click();
    onChange.unsubscribe();
  });
});
