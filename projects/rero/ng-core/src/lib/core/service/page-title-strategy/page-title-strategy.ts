/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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
import { inject, Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from "@ngx-translate/core";
import { Config, CoreConfigService } from "../core-config/core-config.service";

@Injectable({
  providedIn: 'root'
})
export class PageTitleStrategy extends TitleStrategy {

  private title = inject(Title);
  private config: Config = inject(CoreConfigService);
  private translate = inject(TranslateService);


  override updateTitle(routerState: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(routerState);
    const projectTitle = this.config.projectTitle ?? '';

    const translatedRouteTitle = routeTitle
      ? this.translate.instant(routeTitle)
      : '';

    const fullTitle =
      translatedRouteTitle && projectTitle
        ? `${translatedRouteTitle} | ${projectTitle}`
        : translatedRouteTitle || projectTitle || '-';

    this.title.setTitle(fullTitle);
  }

}
