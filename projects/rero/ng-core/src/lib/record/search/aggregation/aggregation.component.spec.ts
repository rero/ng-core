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
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

import { RecordSearchAggregationComponent } from './aggregation.component';
import { UpperCaseFirstPipe } from '../../../pipe/ucfirst.pipe';
import { TranslateLanguagePipe } from '../../../translate-language/translate-language.pipe';

describe('RecordSearchAggregationComponent', () => {
  let component: RecordSearchAggregationComponent;
  let fixture: ComponentFixture<RecordSearchAggregationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RecordSearchAggregationComponent,
        UpperCaseFirstPipe,
        TranslateLanguagePipe
      ],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchAggregationComponent);
    component = fixture.componentInstance;
    component.aggregation = {
      key: 'author',
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
    component.selectedValues = ['Filippini, Massimo'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true if value is selected', () => {
    expect(component.isSelected('Filippini, Massimo')).toBe(true);
  });

  it('should show aggregation filter', () => {
    expect(component.showAggregation()).toBe(true);

    component.expand = false;
    expect(component.showAggregation()).toBe(true);
  });

  it('should add value to selected filters', () => {
    component.updateFilter('Botturi, Luca');
    expect(component.selectedValues.includes('Botturi, Luca')).toBe(true);
  });

  it('should remove value from selected filters', () => {
    component.updateFilter('Filippini, Massimo');
    expect(component.selectedValues.includes('Filippini, Massimo')).toBe(false);
  });
});
