// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Injectable } from '@angular/core';
import { LanguageLoaderFn, TranslateLanguageService } from '@rero/ng-core';

const ngCoreLanguage = (lang: string): LanguageLoaderFn =>
  () => fetch(`/assets/ng-core/languages/${lang}.json`).then(r => r.json());

@Injectable({ providedIn: 'root' })
export class AppTranslateLanguageService extends TranslateLanguageService {
  initialize(): Promise<void> {
    return this.loadLanguages({
      de: ngCoreLanguage('de'),
      fr: ngCoreLanguage('fr'),
      it: ngCoreLanguage('it'),
    });
  }
}
