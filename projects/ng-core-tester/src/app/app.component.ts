/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { CoreConfigService, RecordEvent, RecordService, TitleMetaService } from '@rero/ng-core';
import { BsLocaleService } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';

/**
 * Main component of the application.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  // Current lang of the application
  lang: string = document.documentElement.lang;

  // Available languages
  languages: string[];

  // If navigation is collapsed or not.
  isCollapsed = true;

  // List of links in the navigation.
  linksMenu = {
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

  // List of languages in the navigation.
  languagesMenu = {
    navCssClass: 'navbar-nav',
    entries: []
  };

  // Active language.
  private _activeLanguagesMenuItem: any;

  /**
   * Constructor.
   * @param _translateService Translate service.
   * @param _configService Configuration service.
   * @param _titleMetaService Meta service.
   * @param _recordService Record service.
   * @param _toastrService Toast service.
   * @param _bsLocaleService Locale service for bootstrap.
   */
  constructor(
    private _translateService: TranslateService,
    private _configService: CoreConfigService,
    private _titleMetaService: TitleMetaService,
    private _recordService: RecordService,
    private _toastrService: ToastrService,
    private _bsLocaleService: BsLocaleService
  ) {
  }

  /**
   * Component initialization.
   *
   * - Initializes listener to record changes.
   * - Initializes languages and current language.
   * - Sets title metadata.
   */
  ngOnInit() {
    this.initializeEvents();
    this._translateService.use(this.lang);
    this.languages = this._configService.languages;
    for (const lang of this.languages) {
      const data: any = { name: lang };
      if (lang === this.lang) {
        data.active = true;
        this._activeLanguagesMenuItem = data;
      }
      this.languagesMenu.entries.push(data);
    }
    // Set default title window when application start
    const prefix = this._configService.prefixWindow;
    if (prefix) {
      this._titleMetaService.setPrefix(prefix);
    }
    this._titleMetaService.setTitle('Welcome');
  }

  /**
   * Changes the languages.
   * @param item Menu item representing a language.
   */
  changeLang(item: any) {
    this._translateService.use(item.name);
    this._bsLocaleService.use(item.name);
    delete (this._activeLanguagesMenuItem.active);
    item.active = true;
    this._activeLanguagesMenuItem = item;
  }

  /**
   * Initializes listening of events when a record is changed.
   */
  private initializeEvents() {
    this._recordService.onCreate$.subscribe((recordEvent: RecordEvent) => {
      const pid = recordEvent.data.record.pid;
      this._toastrService.info(`Call Record Event on create (Record Pid: ${pid})`);
    });
    this._recordService.onUpdate$.subscribe((recordEvent: RecordEvent) => {
      const pid = recordEvent.data.record.pid;
      this._toastrService.info(`Call Record Event on update (Record Pid: ${pid})`);
    });
    this._recordService.onDelete$.subscribe((recordEvent: RecordEvent) => {
      const pid = recordEvent.data.pid;
      this._toastrService.info(`Call Record Event on delete (Record Pid: ${pid})`);
    });
  }
}
