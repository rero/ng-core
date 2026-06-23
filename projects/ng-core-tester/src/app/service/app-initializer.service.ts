// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppTranslateLanguageService } from './app-translate-language.service';
import { from, Observable, switchMap } from 'rxjs';
import { AppUserService } from './app-user.service';

@Injectable({ providedIn: 'root' })
export class AppInitializerService {
  private translateService = inject(TranslateService);
  private userService = inject(AppUserService);
  private translateLanguageService = inject(AppTranslateLanguageService);

  initialize(): Observable<unknown> {
    return this.userService.getUserInfo().pipe(
      switchMap((userInfo) => {
        const availableLanguages = userInfo.settings.availableLanguages.map((l) => l.code);
        this.translateService.addLangs(availableLanguages);

        return from(this.translateLanguageService.initialize()).pipe(
          switchMap(() => {
            const preferred = userInfo.settings.language;
            const browserLang = navigator.language.split('-')[0];
            const lang = availableLanguages.includes(preferred)
              ? preferred
              : availableLanguages.includes(browserLang)
                ? browserLang
                : (availableLanguages[0] ?? 'en');

            return this.translateService.use(lang);
          }),
        );
      }),
    );
  }
}
