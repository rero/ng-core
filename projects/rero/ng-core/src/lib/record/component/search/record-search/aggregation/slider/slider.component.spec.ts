// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RecordSearchStore } from '../../../store/record-search.store';
import { AggregationSliderComponent } from './slider.component';

describe('AggregationSliderComponent', () => {
  let component: AggregationSliderComponent;
  let fixture: ComponentFixture<AggregationSliderComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        InputNumberModule,
        ButtonModule,
        AggregationSliderComponent,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
      ],
      providers: [RecordSearchStore, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationSliderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('key', 'year');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
