// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Injectable } from '@angular/core';
import { CORE_TRANSLATION_LOADERS, CoreTranslateLoader, TranslationLoaderFn } from '@rero/ng-core';

const ngCoreI18n = (lang: string): TranslationLoaderFn =>
  () => fetch(`/assets/ng-core/i18n/${lang}.json`)
    .then(r => r.json())
    .then(data => ({ default: data }));

@Injectable()
export class AppTranslateLoader extends CoreTranslateLoader {
  protected override coreTranslationLoaders: Record<string, TranslationLoaderFn> = {
    ...CORE_TRANSLATION_LOADERS,
    de: ngCoreI18n('de'),
    fr: ngCoreI18n('fr'),
    it: ngCoreI18n('it'),
  };
}
