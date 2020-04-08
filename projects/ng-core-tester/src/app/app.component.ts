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
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CoreConfigService, TitleMetaService, RecordService, RecordEvent } from '@rero/ng-core';
import { ToastrService } from 'ngx-toastr';
import { BsLocaleService } from 'ngx-bootstrap';


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
        name: 'Records',
        href: '#',
        cssActiveClass: '',
        entries: [
          {
            name: 'Global records',
            routerLink: '/record/search/documents',
            iconCssClass: 'fa fa-book'
          },
          {
            name: 'UNISI records',
            routerLink: '/unisi/record/search/documents'
          },
          {
            name: 'Backend records',
            routerLink: '/admin/record/search/documents'
          },
          {
            name: 'Document records',
            routerLink: '/records/documents'
          },
          {
            name: 'Organizations records',
            routerLink: '/records/institutions'
          }
        ]
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
    private configService: CoreConfigService,
    private titleMetaService: TitleMetaService,
    private recordService: RecordService,
    private toastrService: ToastrService,
    private bsLocaleService: BsLocaleService
    ) {
    }

    ngOnInit() {
      this.initializeEvents();
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
      // Set default title window when application start
      const prefix = this.configService.prefixWindow;
      if (prefix) {
        this.titleMetaService.setPrefix(prefix);
      }
      this.titleMetaService.setTitle('Welcome');
    }

    changeLang(item: any) {
      this.translateService.use(item.name);
      this.bsLocaleService.use(item.name);
      delete(this.activeLanguagesMenuItem.active);
      item.active = true;
      this.activeLanguagesMenuItem = item;
    }

    private initializeEvents() {
      this.recordService.onCreate$.subscribe((recordEvent: RecordEvent) => {
        const pid = recordEvent.data.record.pid;
        this.toastrService.info(`Call Record Event on create (Record Pid: ${pid})`);
      });
      this.recordService.onUpdate$.subscribe((recordEvent: RecordEvent) => {
        const pid = recordEvent.data.record.pid;
        this.toastrService.info(`Call Record Event on update (Record Pid: ${pid})`);
      });
      this.recordService.onDelete$.subscribe((recordEvent: RecordEvent) => {
        const pid = recordEvent.data.pid;
        this.toastrService.info(`Call Record Event on delete (Record Pid: ${pid})`);
      });
    }
  }
