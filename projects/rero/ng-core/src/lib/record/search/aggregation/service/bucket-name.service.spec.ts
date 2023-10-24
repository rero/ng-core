/*
 * RERO angular core
 * Copyright (C) 2019-2023 RERO
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
import { TestBed } from '@angular/core/testing';
import { BucketNameService } from './bucket-name.service';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

describe('BucketNameService', () => {
  let service: BucketNameService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ]
    });
    service = TestBed.inject(BucketNameService);
    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en');
    translateService.setTranslation('en', {
      bar: 'bar translated',
      lang_fre: 'french'
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the correct key for the default value', () => {
    service.transform('foo', 'bar').subscribe((data: string) => {
      expect(data).toEqual('bar translated');;
    });
  });

  it('should return the correct key for the language', () => {
    service.transform('language', 'fre').subscribe((data: string) => {
      expect(data).toEqual('french');;
    });
  });
});
