/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RecordModule } from '../../record.module';
import { RecordSearchService } from '../record-search.service';
import { RecordSearchAggregationComponent } from './aggregation.component';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PanelModule } from 'primeng/panel';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CheckboxModule } from 'primeng/checkbox';

describe('RecordSearchAggregationComponent', () => {
  let component: RecordSearchAggregationComponent;
  let componentRef: ComponentRef<RecordSearchAggregationComponent>;
  let fixture: ComponentFixture<RecordSearchAggregationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [PanelModule,
        RecordModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        CheckboxModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })],
    providers: [RecordSearchService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  }));

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
            key: 'Filippini, Massimo'
          },
          {
            doc_count: 9,
            key: 'Botturi, Luca'
          }
        ]
      },
      expanded: false,
      type: 'terms',
      config: {}
    });
    componentRef.setInput('aggregationsFilters', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the list of values for the aggregation', () => {
    component.aggregationClicked.subscribe((element: any) => {
      expect(element).toEqual({ key: 'author', expanded: true});
    });
    const toggleable = fixture.debugElement.nativeElement.querySelector('plusicon');
    toggleable.click();
  });
});
