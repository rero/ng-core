/*
 * RERO angular core
 * Copyright (C) 2022 RERO
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

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BucketNamePipe } from '../pipe/bucket-name.pipe';
import { ListFiltersComponent } from './list-filters.component';

describe('ListFiltersComponent', () => {
  let component: ListFiltersComponent;
  let fixture: ComponentFixture<ListFiltersComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
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
    component.filters = [
      { key: 'on_shelf', aggregationKey: 'status' },
      { key: 'docmaintype_serial', aggregationKey: 'document_type' }
    ];
    translateService.setTranslation('en', {
      on_shelf: 'available',
      docmaintype_serial: 'serial'
    });
    translateService.use('en');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 2 buttons', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('ul#filters li > button');
    expect(buttons.length).toBe(2);
  });

  it('should display button available', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('ul#filters li > button');
    expect(buttons[0].innerHTML).toContain('available');
  });

  it('should display button serial', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('ul#filters li > button');
    expect(buttons[1].innerHTML).toContain('serial');
  });
});
