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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SearchInputComponent } from './search-input.component';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  let searchInput: HTMLInputElement;
  let searchButton: HTMLInputElement;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchInputComponent],
      imports: [
        InputGroupModule,
        InputGroupAddonModule,
        AutoFocusModule,
        ButtonModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    searchInput = fixture.nativeElement.querySelector('#search');
    searchButton = fixture.nativeElement.querySelector('p-inputgroupaddon p-button button');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event on click on search button', () => {
    const query = 'search click';
    searchInput.value = query;

    component.search.subscribe((text: string) => {
      expect(text).toBe(query);
    });

    searchButton.click();

    fixture.detectChanges();
  });

  it('should emit event on enter key pressed', () => {
    const query = 'search enter key';
    searchInput.value = query;

    component.search.subscribe((text: string) => {
      expect(text).toBe(query);
    });

    searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  });
});
