// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { CoreTranslateLoader, versionedUrl } from './translate-loader';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CoreConfigService } from '../../core/service/core-config/core-config.service';
import { ALLOW_HTTP_CACHE } from '../../core/interceptor/no-cache.interceptor';

describe('CoreTranslateLoader', () => {
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: () => {
            const loader = new CoreTranslateLoader();
            (loader as any).coreTranslationLoaders = {};
            return loader;
          },
            deps: [HttpClient],
          },
        }),
      ],
      providers: [
        TranslateService,
        {
          provide: CoreConfigService,
          useValue: {
            languages: ['fr'],
            translationsURLs: ['/assets/i18n/${lang}.json'],
          },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    translate = TestBed.inject(TranslateService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    translate = undefined as any;
    http = undefined as any;
  });

  it('should be able to provide CoreTranslateLoader', () => {
    expect(TranslateLoader).toBeDefined();
    expect(translate.currentLoader).toBeDefined();
    expect(translate.currentLoader instanceof CoreTranslateLoader).toBeTruthy();
  });

  it('should be able to get translations', () => {
    translate.use('en');

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/en.json').flush({
      TEST: 'This is a test',
      TEST2: 'This is another test',
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
      'does not exists': 'Existe pas',
      Help: 'Aide',
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

describe('versionedUrl', () => {
  it('should append the version as query parameter', () => {
    expect(versionedUrl('/assets/i18n/fr.json', '1.2.0')).toBe('/assets/i18n/fr.json?v=1.2.0');
  });

  it('should keep existing query parameters', () => {
    expect(versionedUrl('/assets/i18n/fr.json?a=b', '1.2.0')).toBe('/assets/i18n/fr.json?a=b&v=1.2.0');
  });

  it('should return the URL unchanged without version', () => {
    expect(versionedUrl('/assets/i18n/fr.json', '')).toBe('/assets/i18n/fr.json');
  });
});

describe('CoreTranslateLoader with versioned URLs', () => {
  let http: HttpTestingController;

  const setup = (translationsVersion: string) => {
    TestBed.configureTestingModule({
      providers: [
        CoreTranslateLoader,
        {
          provide: CoreConfigService,
          useValue: {
            translationsURLs: [{ url: '/assets/i18n/${lang}.json', versioned: true }, '/api/translations/${lang}.json'],
            translationsVersion,
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const loader = TestBed.inject(CoreTranslateLoader);
    (loader as any).coreTranslationLoaders = {};
    return loader;
  };

  afterEach(() => http.verify());

  it('should version and allow the cache for static files only', () => {
    setup('1.2.0').getTranslation('fr').subscribe();

    const staticReq = http.expectOne('/assets/i18n/fr.json?v=1.2.0');
    expect(staticReq.request.context.get(ALLOW_HTTP_CACHE)).toBe(true);
    const apiReq = http.expectOne('/api/translations/fr.json');
    expect(apiReq.request.context.get(ALLOW_HTTP_CACHE)).toBe(false);
    staticReq.flush({});
    apiReq.flush({});
  });

  it('should not allow the cache without version', () => {
    setup('').getTranslation('fr').subscribe();

    const staticReq = http.expectOne('/assets/i18n/fr.json');
    expect(staticReq.request.context.get(ALLOW_HTTP_CACHE)).toBe(false);
    staticReq.flush({});
    http.expectOne('/api/translations/fr.json').flush({});
  });
});
