// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateLanguageService } from '../../service/translate-language/translate-language.service';
import { TranslateLanguagePipe } from './translate-language.pipe';

class TranslateLanguageServiceMock {
  private _currentLang = 'en';
  readonly languagesVersion = signal(0);

  setCurrentLang(lang: string) { this._currentLang = lang; }

  translate(langCode: string, language?: string) {
    const lang = language ?? this._currentLang;
    return `${langCode}-${lang}-v${this.languagesVersion()}`;
  }
}

@Component({
  selector: 'ng-core-test-host',
  template: `<span>{{ langCode | translateLanguage }}</span>`,
  imports: [TranslateLanguagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  langCode = 'fre';
}

@Component({
  selector: 'ng-core-test-host-explicit',
  template: `<span>{{ langCode | translateLanguage : lang }}</span>`,
  imports: [TranslateLanguagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostExplicitComponent {
  langCode = 'fre';
  lang = 'fr';
}

describe('TranslateLanguagePipe', () => {
  let translateService: TranslateService;
  let languageServiceMock: TranslateLanguageServiceMock;

  beforeEach(() => {
    languageServiceMock = new TranslateLanguageServiceMock();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TranslateLanguageService, useValue: languageServiceMock },
      ],
    });
    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en');
  });

  it('should create an instance', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should transform language code using current language', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span');
    expect(span.textContent.trim()).toBe('fre-en-v0');
  });

  it('should transform language code using explicit language', () => {
    const fixture = TestBed.createComponent(TestHostExplicitComponent);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span');
    expect(span.textContent.trim()).toBe('fre-fr-v0');
  });

  it('should re-render when language changes via translateService', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent.trim()).toBe('fre-en-v0');

    languageServiceMock.setCurrentLang('fr');
    translateService.use('fr');
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span').textContent.trim()).toBe('fre-fr-v0');
  });

  it('should re-render when languagesVersion signal changes', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent.trim()).toBe('fre-en-v0');

    languageServiceMock.languagesVersion.update(v => v + 1);
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span').textContent.trim()).toBe('fre-en-v1');
  });
});
