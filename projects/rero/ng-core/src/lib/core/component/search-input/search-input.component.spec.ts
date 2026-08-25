// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputGroupModule } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddonModule } from '@openng/optimus-ui/inputgroupaddon';
import { SearchInputComponent } from './search-input.component';
import { AutoFocusModule } from '@openng/optimus-ui/autofocus';
import { ButtonModule } from '@openng/optimus-ui/button';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  let searchInput: HTMLInputElement;
  let searchButton: HTMLInputElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [InputGroupModule, InputGroupAddonModule, AutoFocusModule, ButtonModule, SearchInputComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    // Set required input before detectChanges
    fixture.componentRef.setInput('searchText', '');
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

    component.searchQuery.subscribe((text: string) => {
      expect(text).toBe(query);
    });

    searchButton.click();

    fixture.detectChanges();
  });

  it('should emit event on enter key pressed', () => {
    const query = 'search enter key';
    searchInput.value = query;

    component.searchQuery.subscribe((text: string) => {
      expect(text).toBe(query);
    });

    searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  });
});
