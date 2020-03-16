import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BucketsComponent } from './buckets.component';
import { TranslateLanguagePipe } from '../../../../translate/translate-language.pipe';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('BucketsComponent', () => {
  let component: BucketsComponent;
  let fixture: ComponentFixture<BucketsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BucketsComponent,
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
    fixture = TestBed.createComponent(BucketsComponent);
    component = fixture.componentInstance;
    component.buckets = [
      {
        doc_count: 30,
        key: 'Filippini, Massimo'
      },
      {
        doc_count: 9,
        key: 'Botturi, Luca'
      }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
