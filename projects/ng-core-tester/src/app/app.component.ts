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
import { CoreConfigService, MenuItem, RecordEvent, RecordService, TitleMetaService, TranslateService } from '@rero/ng-core';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { AppMenuService } from './service/app-menu.service';

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

  // Application menu
  appMenu: MenuItem;

  // Application language menu
  languageMenu: MenuItem;

  /**
   * Constructor.
   * @param _translateService Translate service.
   * @param _configService Configuration service.
   * @param _titleMetaService Meta service.
   * @param _recordService Record service.
   * @param _toastrService Toast service.
   * @param _bsLocaleService Locale service for bootstrap.
   * @param _menuService Interface menu
   */
  constructor(
    private _translateService: TranslateService,
    private _configService: CoreConfigService,
    private _titleMetaService: TitleMetaService,
    private _recordService: RecordService,
    private _toastrService: ToastrService,
    private _bsLocaleService: BsLocaleService,
    private _appMenuService: AppMenuService
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
    this._translateService.setLanguage(this.lang);
    this.appMenu = this._appMenuService.generateApplicationMenu();
    this.languageMenu = this._appMenuService.generateLanguageMenu(
      this._configService.languages,
      this.lang
    );
    // Set default title window when application start
    const prefix = this._configService.prefixWindow;
    if (prefix) {
      this._titleMetaService.setPrefix(prefix);
    }
    this._titleMetaService.setTitle('Welcome');
  }

  /**
   * Event change language
   * @param item - MenuItem
   */
  eventChangeLang(item: MenuItem) {
    this.languageMenu.getChildren().forEach((menu: MenuItem) => {
      if (menu.isActive()) {
        menu.deleteLabelAttribute('class');
        menu.setActive(false);
      }
    });
    item.setLabelAttribute('class', 'font-weight-bold')
        .setActive(true);
    this._translateService.setLanguage(item.getName());
    this._bsLocaleService.use(item.getName());
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
