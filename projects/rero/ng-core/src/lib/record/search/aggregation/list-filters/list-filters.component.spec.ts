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
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { BucketNamePipe } from '../pipe/bucket-name.pipe';
import { IFilter, ListFiltersComponent } from './list-filters.component';

describe('ListFiltersComponent', () => {
  let component: ListFiltersComponent;
  let componentRef: ComponentRef<ListFiltersComponent>;
  let fixture: ComponentFixture<ListFiltersComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ButtonModule
      ],
      declarations: [
        ListFiltersComponent,
        BucketNamePipe
      ]
    })
    .compileComponents();
    translateService = TestBed.inject(TranslateService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFiltersComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('aggregationsFilters', [
      { key: 'simple', values: ['1']},
      { key: 'document_type', values: ['docmaintype_article', 'docmaintype_series'] },
      { key: 'year', values: ['1745--2050'] },
      { key: 'range', values: ['1704099600000--1714550400000'] }
    ]);
    translateService.setTranslation('en', {
      'docmaintype_article': 'Article',
      'docmaintype_series': 'Serial'
    });
    translateService.use('en');
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

  it('should return an event when the filter is deleted', () => {
    let event: IFilter = {
      aggregationKey: 'document_type',
      key: 'docmaintype_article'
    };
    let subscribe = component.remove.subscribe((filter: IFilter) => {
      expect(filter).toEqual(event)
    });
    let buttons = fixture.debugElement.nativeElement.querySelectorAll('p-button');
    buttons[0].click();
    subscribe.unsubscribe();

    event = {
      aggregationKey: 'year',
      key: '1745--2050',
      name: '1745 - 2050'
    };
    subscribe = component.remove.subscribe((filter: IFilter) => {
      expect(filter).toEqual(event)
    });

    buttons = fixture.debugElement.nativeElement.querySelectorAll('p-button');
    buttons[2].click();
    subscribe.unsubscribe();
  });
});
