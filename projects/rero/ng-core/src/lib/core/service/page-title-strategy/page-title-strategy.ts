// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Config, CoreConfigService } from '../core-config/core-config.service';

@Injectable({
  providedIn: 'root',
})
export class PageTitleStrategy extends TitleStrategy {
  private title = inject(Title);
  private config: Config = inject(CoreConfigService);
  private translate = inject(TranslateService);
  private lastRouterState: RouterStateSnapshot | null = null;

  constructor() {
    super();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => {
        if (this.lastRouterState) {
          this.updateTitle(this.lastRouterState);
        }
      });
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    this.lastRouterState = routerState;

    const routeTitle = this.buildTitle(routerState);
    const projectTitle = this.config.projectTitle ?? '';
    const translatedRouteTitle = routeTitle ? this.translate.instant(routeTitle) : '';

    const fullTitle =
      translatedRouteTitle && projectTitle
        ? `${translatedRouteTitle} | ${projectTitle}`
        : translatedRouteTitle || projectTitle || '-';

    this.title.setTitle(fullTitle);
  }
}
