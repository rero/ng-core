import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLanguagePipe } from '../../../../translate/translate-language.pipe';
import { RecordSearchService } from '../../record-search.service';
import { BucketsComponent } from './buckets.component';

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
      ],
      providers: [RecordSearchService]
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
