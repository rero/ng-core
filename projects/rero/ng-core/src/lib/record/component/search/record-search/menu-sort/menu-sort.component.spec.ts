// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RecordSearchStore } from '../../store/record-search.store';
import { MenuSortComponent } from './menu-sort.component';

const SORT_OPTIONS = [
  { label: 'Pertinence', value: 'pertinence', defaultQuery: true, defaultNoQuery: false, icon: '' },
];

const SORT_OPTIONS_ORDER = [
  { label: 'Date start', value: 'date_start', defaultQuery: false, defaultNoQuery: false, icon: '' },
  { label: 'Date end', value: 'date_end', defaultQuery: false, defaultNoQuery: false, icon: '' },
  { label: 'Available', value: 'available', defaultQuery: false, defaultNoQuery: false, icon: '' },
];

describe('MenuSortComponent', () => {
  let component: MenuSortComponent;
  let fixture: ComponentFixture<MenuSortComponent>;
  let translateService: TranslateService;
  let store: InstanceType<typeof RecordSearchStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, TranslateModule.forRoot(), MenuModule, ButtonModule, MenuSortComponent],
      providers: [RecordSearchStore, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.use('en');
    translateService.setTranslation('fr', {
      'Date start': 'Date de début',
      'Date end': 'Date de fin',
      Available: 'Disponibilité',
    });

    store = TestBed.inject(RecordSearchStore);
    store.updateRouteConfig({
      types: [{ key: 'documents', label: 'Documents', sortOptions: SORT_OPTIONS } as any],
    });
    store.setCurrentType('documents');

    fixture = TestBed.createComponent(MenuSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have values from store', () => {
    expect(component.selectedOption()).toBeUndefined();
    expect(component.options()[0].command).not.toBeNull();
  });

  it('should not display the menu', () => {
    store.updateRouteConfig({
      types: [{ key: 'documents', label: 'Documents', sortOptions: [] } as any],
    });
    fixture.detectChanges();
    const menu = fixture.debugElement.nativeElement.querySelector('p-menu');
    expect(menu).toBeNull();
  });

  it('should display the menu', () => {
    const menu = fixture.debugElement.nativeElement.querySelector('p-menu');
    expect(menu).not.toBeNull();
  });

  it('should return the value selected by default', () => {
    store.updateSort('pertinence');
    fixture.detectChanges();
    expect(component.selectedOption()!.label).toEqual('Pertinence');
  });

  it('should return the sorted values', () => {
    store.updateRouteConfig({
      types: [{ key: 'documents', label: 'Documents', sortOptions: SORT_OPTIONS_ORDER } as any],
    });
    fixture.detectChanges();
    expect(component.options()[0].value).toEqual('available');
    expect(component.options()[1].value).toEqual('date_end');
    expect(component.options()[2].value).toEqual('date_start');
  });

  it('should translate labels on language change', () => {
    store.updateRouteConfig({
      types: [{ key: 'documents', label: 'Documents', sortOptions: SORT_OPTIONS_ORDER } as any],
    });
    fixture.detectChanges();
    // English (default)
    expect(component.options()[0].label).toEqual('Available');
    expect(component.options()[1].label).toEqual('Date end');
    expect(component.options()[2].label).toEqual('Date start');
    // French after switch language
    translateService.use('fr');
    expect(component.options()[0].label).toEqual('Date de début');
    expect(component.options()[1].label).toEqual('Date de fin');
    expect(component.options()[2].label).toEqual('Disponibilité');
  });
});
