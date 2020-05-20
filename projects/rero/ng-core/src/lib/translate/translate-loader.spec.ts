/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { CoreConfigService } from '../core-config.service';
import { TranslateLoader } from './translate-loader';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService, TranslateLoader as NgxTranslateLoader } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('TranslateLoader', () => {
  let translate: TranslateService;
  let http: HttpTestingController;
  let config = {};

  beforeEach(() => {
    config = {
      languages: ['fr'],
      translationsURLs: [
        '/assets/i18n/${lang}.json'
      ]
    };
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: NgxTranslateLoader,
            useFactory: (httpClient: HttpClient) => new TranslateLoader(config as CoreConfigService, httpClient),
            deps: [HttpClient]
          }
        })
      ],
      providers: [TranslateService]
    });
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    translate = undefined;
    http = undefined;
  });

  it('should be able to provide TranslateLoader', () => {
    expect(TranslateLoader).toBeDefined();
    expect(translate.currentLoader).toBeDefined();
    expect(translate.currentLoader instanceof TranslateLoader).toBeTruthy();
  });

  it('should be able to get translations', () => {
    translate.use('en');

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/en.json').flush({
      TEST: 'This is a test',
      TEST2: 'This is another test'
    });

    // this will request the translation from the backend because we use a static files loader for TranslateService
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a test');
    });

    // this will request the translation from downloaded translations without making a request to the backend
    translate.get('TEST2').subscribe((res: string) => {
      expect(res).toEqual('This is another test');
    });
  });

  it('should be able to get translations in french', () => {
    translate.use('fr');

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/fr.json').flush({
      search: 'Recherche avancée',
      'does not exists': 'Existe pas'
    });

    // ng-core translations
    translate.get('Help').subscribe((res: string) => {
      expect(res).toEqual('Aide');
    });

    // override translation
    translate.get('search').subscribe((res: string) => {
      expect(res).toEqual('Recherche avancée');
    });

    // new translations
    translate.get('does not exists').subscribe((res: string) => {
      expect(res).toEqual('Existe pas');
    });
  });

});
