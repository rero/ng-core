/*
 * RERO angular core
 * Copyright (C) 2022-2024 RERO
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { RecordSearchStore } from '../../../store/record-search.store';
import { BucketNamePipe } from '../buckets/bucket-name.pipe';
import { ListFiltersComponent } from './list-filters.component';

describe('ListFiltersComponent', () => {
  let component: ListFiltersComponent;
  let fixture: ComponentFixture<ListFiltersComponent>;
  let translateService: TranslateService;
  let store: InstanceType<typeof RecordSearchStore>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ButtonModule, ListFiltersComponent, BucketNamePipe],
      providers: [RecordSearchStore, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();
    translateService = TestBed.inject(TranslateService);
    store = TestBed.inject(RecordSearchStore);
  });

  beforeEach(() => {
    store.updateAggregationsFilter('simple', ['1']);
    store.updateAggregationsFilter('document_type', ['docmaintype_article', 'docmaintype_series']);
    store.updateAggregationsFilter('year', ['1745--2050']);
    store.updateAggregationsFilter('range', ['1704099600000--1714550400000']);
    translateService.setTranslation('en', {
      docmaintype_article: 'Article',
      docmaintype_series: 'Serial',
    });
    translateService.use('en');
    fixture = TestBed.createComponent(ListFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 4 buttons', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('p-button');
    expect(buttons.length).toBe(4);
  });

  it('should have the button label translated', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('p-button');
    expect(buttons[0].innerHTML).toContain('Article');
    expect(buttons[2].innerHTML).toContain('1745 - 2050');
    expect(buttons[3].innerHTML).toContain('1/1/2024 - 5/1/2024');
  });

  it('should remove a filter from the store when the button is clicked', () => {
    let buttons = fixture.debugElement.nativeElement.querySelectorAll('p-button');
    buttons[0].querySelector('button').click();
    fixture.detectChanges();
    const docTypeFilter = store.aggregationsFilters().find((f) => f.key === 'document_type');
    expect(docTypeFilter?.values).not.toContain('docmaintype_article');

    buttons = fixture.debugElement.nativeElement.querySelectorAll('p-button');
    const yearButton = Array.from(buttons).find((button: any) => button.innerHTML.includes('1745 - 2050')) as
      | HTMLElement
      | undefined;
    yearButton?.querySelector('button')?.click();
    fixture.detectChanges();
    const yearFilter = store.aggregationsFilters().find((f) => f.key === 'year');
    expect(yearFilter).toBeUndefined();
  });
});
