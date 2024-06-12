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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SearchAutocompleteComponent } from './search-autocomplete.component';

describe('SearchAutocompleteComponent', () => {
  let component: SearchAutocompleteComponent;
  let fixture: ComponentFixture<SearchAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchAutocompleteComponent],
      imports: [
        AutoCompleteModule,
        HttpClientTestingModule,
        FormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('recordTypes', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('p-autocomplete')).toHaveSize(1);
  });

  it('should emit a value', () => {
    const data = { label: 'Foo', value: 'foo', index: 'documents' };
    component.onSelect.subscribe((value: any) => {
      expect(value).toEqual(data);
    });
    component.onSelectValue({
      originalEvent: undefined,
      value: data
    })
  });
});
