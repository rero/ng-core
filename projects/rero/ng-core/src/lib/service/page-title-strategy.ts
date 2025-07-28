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
import { CoreConfigService } from "../core-config.service";

@Injectable({
  providedIn: 'root'
})

export class PageTitleStrategy extends TitleStrategy {

  private title = inject(Title);
  private config = inject(CoreConfigService);
  private translate = inject(TranslateService);

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    let projectTitle = '';

    if (this.config.projectTitle) {
      projectTitle = this.config.projectTitle;
    }
    if (projectTitle && title) {
      this.title.setTitle(`${this.translate.instant(title)} | ${projectTitle}`);
    } else if (projectTitle) {
      this.title.setTitle(projectTitle);
    } else if (title) {
      this.title.setTitle(this.translate.instant(title));
    } else {
      this.title.setTitle('-');
    }
  }
}
