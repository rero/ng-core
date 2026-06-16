// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RecordSearchStore } from '../../store/record-search.store';
import { SearchTabsComponent } from './search-tabs.component';

describe('SearchTabsComponent', () => {
  let component: SearchTabsComponent;
  let fixture: ComponentFixture<SearchTabsComponent>;
  let store: InstanceType<typeof RecordSearchStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        TabsModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        SearchTabsComponent,
      ],
      providers: [RecordSearchStore, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
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
});
