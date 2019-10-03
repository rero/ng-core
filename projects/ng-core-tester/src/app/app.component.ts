/*
* Invenio angular core
* Copyright (C) 2019 RERO
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
import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CoreConfigService } from '@rero/ng-core';
import { Config, AlertService } from '@rero/ng-core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  lang: string = document.documentElement.lang;
  languages: string[];
  isCollapsed = true;

  public linksMenu = {
    navCssClass: 'navbar-nav',
    entries: [
      {
        name: 'Home',
        routerLink: '/',
        cssActiveClass: '',
        iconCssClass: 'fa fa-home'
      },
      {
        name: 'Global records',
        routerLink: '/record/search/documents',
        iconCssClass: 'fa fa-book'
      },
      {
        name: 'USI records',
        routerLink: '/usi/record/search/documents'
      },
      {
        name: 'HEVS records',
        routerLink: '/hevs/record/search/documents'
      },
      {
        name: 'Backend records',
        routerLink: '/admin/record/search/documents'
      }
    ]
  };

  languagesMenu = {
    navCssClass: 'navbar-nav',
    entries: []
  };

  private activeLanguagesMenuItem;

  constructor(
    private translateService: TranslateService,
    private configService: CoreConfigService
    ) {
    }

    ngOnInit() {
      this.translateService.use(this.lang);
      this.languages = this.configService.languages;
      for (const lang of this.languages) {
        const data: any = {name: lang};
        if (lang === this.lang) {
          data.active = true;
          this.activeLanguagesMenuItem = data;
        }
        this.languagesMenu.entries.push(data);
      }
    }

    changeLang(item) {
      this.translateService.use(item.name);
      delete(this.activeLanguagesMenuItem.active);
      item.active = true;
      this.activeLanguagesMenuItem = item;
    }

  }
