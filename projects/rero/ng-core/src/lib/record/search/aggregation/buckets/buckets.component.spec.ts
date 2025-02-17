/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLanguagePipe } from '../../../../translate/translate-language.pipe';
import { RecordSearchService } from '../../record-search.service';
import { BucketNamePipe } from '../pipe/bucket-name.pipe';
import { BucketsComponent } from './buckets.component';
import { ComponentRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

describe('BucketsComponent', () => {
  let component: BucketsComponent;
  let componentRef: ComponentRef<BucketsComponent>;
  let fixture: ComponentFixture<BucketsComponent>;
  let recordSearchService: RecordSearchService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        BucketsComponent,
        TranslateLanguagePipe,
        BucketNamePipe
      ],
      imports: [
        FormsModule,
        CheckboxModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [RecordSearchService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    recordSearchService = TestBed.inject(RecordSearchService);
    fixture = TestBed.createComponent(BucketsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('buckets', [
      {
        doc_count: 90,
        key: 'docmaintype_article'
      },
      {
        doc_count: 18,
        key: 'docmaintype_audio'
      }
    ]);
    componentRef.setInput('aggregationKey', 'type');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should assign the new filter', () => {
    const checkbox = fixture.debugElement.nativeElement.querySelectorAll('.p-checkbox-input')[0];
    checkbox.click();
    expect(recordSearchService.hasFilter('type', 'docmaintype_article')).toBeTrue();
  });
});
