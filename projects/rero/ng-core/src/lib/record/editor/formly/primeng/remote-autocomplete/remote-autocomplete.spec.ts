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
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { of } from 'rxjs';
import { RemoteAutocomplete } from './remote-autocomplete';
import { RemoteAutocompleteService } from './remote-autocomplete.service';

describe('RemoteAutocompleteComponent', () => {
  let component: RemoteAutocomplete;
  let fixture: ComponentFixture<RemoteAutocomplete>;

  const suggestions = [
    { label: 'Foo', value: 'foo' },
    { label: 'Bar', value: 'bar' },
  ];

  const valueHtml = 'My value as html';

  const remoteAutocompleteServiceSpy = jasmine.createSpyObj('RemoteAutocompleteService', ['getSuggestions', 'getValueAsHTML']);
  remoteAutocompleteServiceSpy.getSuggestions.and.returnValue(of(suggestions));
  remoteAutocompleteServiceSpy.getValueAsHTML.and.returnValue(of(valueHtml));

  const autoCompleteCompleteEventSpy = jasmine.createSpyObj('AutoCompleteCompleteEvent', ['']);
  autoCompleteCompleteEventSpy.query = '*';

  const autoCompleteSelectEventSpy = jasmine.createSpyObj('AutoCompleteSelectEvent', ['']);
  autoCompleteSelectEventSpy.value = 'myValue';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RemoteAutocomplete],
      imports: [
        AutoCompleteModule,
        FormsModule,
        ReactiveFormsModule,
        FormlyModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        RemoteAutocompleteService,
        { provide: RemoteAutocompleteService, useValue: remoteAutocompleteServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteAutocomplete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the list of suggestions', () => {
    component.search(autoCompleteCompleteEventSpy);
    expect(component.suggestions()).toEqual(suggestions);
  });

  it('should return the value html', () => {
    spyOnProperty(component, 'formControl').and.returnValue(new FormControl());
    component.onSelect(autoCompleteSelectEventSpy);
    expect(component.valueSelected()).toEqual(valueHtml);
  });
});
