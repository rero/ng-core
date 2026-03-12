/*
 * RERO angular core
 * Copyright (C) 2024-2025 RERO
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
