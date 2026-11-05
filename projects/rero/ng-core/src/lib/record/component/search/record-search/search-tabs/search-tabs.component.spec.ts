// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TabsModule } from '@openng/optimus-ui/tabs';

import { RecordSearchStore } from '../../store/record-search.store';
import { SearchTabsComponent } from './search-tabs.component';

describe('SearchTabsComponent', () => {
  let component: SearchTabsComponent;
  let fixture: ComponentFixture<SearchTabsComponent>;
  let store: InstanceType<typeof RecordSearchStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsModule, RouterModule.forRoot([]), SearchTabsComponent],
      providers: [
        RecordSearchStore,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideTranslateService(),
      ],
    }).compileComponents();

    store = TestBed.inject(RecordSearchStore);
    store.updateRouteConfig({
      types: [{ key: 'document', label: 'document' } as any, { key: 'organisation', label: 'organisation' } as any],
    });
    fixture = TestBed.createComponent(SearchTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should display tabs', () => {
    const tabs = fixture.debugElement.nativeElement.querySelectorAll('p-tabs');
    expect(tabs).toHaveLength(1);
    const tab = fixture.debugElement.nativeElement.querySelectorAll('p-tab');
    expect(tab).toHaveLength(2);
  });

  it('should select the tab of the current type', async () => {
    store.updateCurrentType('organisation');
    fixture.detectChanges();
    await fixture.whenStable();

    const selected = fixture.debugElement.nativeElement.querySelector('p-tab[aria-selected="true"]');
    expect(selected.textContent.trim()).toBe('organisation');
  });

  it('should clear the filters when clicking on another tab', async () => {
    store.updateCurrentType('document');
    store.syncUrlParams({ aggregationsFilters: [{ key: 'language', values: ['eng'] }] });
    fixture.detectChanges();
    await fixture.whenStable();

    const tabs: HTMLElement[] = Array.from(fixture.debugElement.nativeElement.querySelectorAll('p-tab'));
    tabs[1].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(store.currentType()).toBe('organisation');
    expect(store.aggregationsFilters()).toEqual([]);
  });
});
