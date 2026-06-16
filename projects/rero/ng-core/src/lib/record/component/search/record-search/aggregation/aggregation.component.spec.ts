// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { RecordSearchStore } from '../../store/record-search.store';
import { RecordSearchAggregationComponent } from './aggregation.component';

describe('RecordSearchAggregationComponent', () => {
  let component: RecordSearchAggregationComponent;
  let componentRef: ComponentRef<RecordSearchAggregationComponent>;
  let fixture: ComponentFixture<RecordSearchAggregationComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NoopAnimationsModule,
        PanelModule,
        CheckboxModule,
        TranslateModule.forRoot(),
        RecordSearchAggregationComponent,
      ],
      providers: [RecordSearchStore, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchAggregationComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('aggregation', {
      key: 'author',
      bucketSize: 2,
      value: {
        buckets: [
          {
            doc_count: 30,
            key: 'Filippini, Massimo',
          },
          {
            doc_count: 9,
            key: 'Botturi, Luca',
          },
        ],
      },
      expanded: false,
      type: 'terms',
      config: {},
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expand the aggregation on toggle click', () => {
    const store = TestBed.inject(RecordSearchStore);
    store.updateAggregations([
      { key: 'author', bucketSize: 2, value: { buckets: [] }, expanded: false, included: false, doc_count: 0, name: 'author' },
    ]);

    expect(component.aggregation().expanded).toBe(false);
    const toggleable = fixture.debugElement.nativeElement.querySelector('button');
    toggleable.click();

    // toggleVisibility updates the store via setAggregationExpanded, not the input signal directly
    expect(store.aggregations().find((a) => a.key === 'author')?.expanded).toBe(true);
  });
});
