/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { UpperCaseFirstPipe } from '../../../pipe/ucfirst.pipe';
import { TranslateLanguagePipe } from '../../../translate/translate-language.pipe';
import { RecordSearchService } from '../record-search.service';
import { RecordSearchAggregationComponent } from './aggregation.component';
import { BucketsComponent } from './buckets/buckets.component';

describe('RecordSearchAggregationComponent', () => {
  let component: RecordSearchAggregationComponent;
  let fixture: ComponentFixture<RecordSearchAggregationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RecordSearchAggregationComponent,
        UpperCaseFirstPipe,
        TranslateLanguagePipe,
        BucketsComponent
      ],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [RecordSearchService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchAggregationComponent);
    component = fixture.componentInstance;
    component.aggregation = {
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
      }
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
