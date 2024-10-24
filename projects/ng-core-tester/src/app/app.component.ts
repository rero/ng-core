/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { Component, OnInit, inject } from '@angular/core';
import { CoreConfigService, RecordEvent, RecordService, TitleMetaService } from '@rero/ng-core';
import { MenuItem, MessageService } from 'primeng/api';

/**
 * Main component of the application.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  /** Service injection */
  // translateService = inject(TranslateService);
  configService = inject(CoreConfigService);
  titleMetaService = inject(TitleMetaService);
  recordService = inject(RecordService);
  messageService = inject(MessageService);

  // Available languages
  languages: string[];

  // If navigation is collapsed or not.
  isCollapsed = true;

  // Application menu
  appMenu: MenuItem;

  // Application language menu
  languageMenu: MenuItem;

  /**
   * Component initialization.
   *
   * - Initializes listener to record changes.
   * - Sets title metadata.
   */
  ngOnInit() {
    this.initializeEvents();
    // Set default title window when application start
    const prefix = this.configService.prefixWindow;
    if (prefix) {
      this.titleMetaService.setPrefix(prefix);
    }
    this.titleMetaService.setTitle('Welcome');
  }

  /**
   * Initializes listening of events when a record is changed.
   */
  private initializeEvents() {
    this.recordService.onCreate$.subscribe((recordEvent: RecordEvent) => {
      const {pid} = recordEvent.data.record;
      this.messageService.add({ severity: 'info', summary: 'Record', detail: `Call Record Event on create (Record Pid: ${pid})`});
    });
    this.recordService.onUpdate$.subscribe((recordEvent: RecordEvent) => {
      const {pid} = recordEvent.data.record;
      this.messageService.add({ severity: 'info', summary: 'Record', detail: `Call Record Event on update (Record Pid: ${pid})`});
    });
    this.recordService.onDelete$.subscribe((recordEvent: RecordEvent) => {
      const {pid} = recordEvent.data.record;
      this.messageService.add({ severity: 'info', summary: 'Record', detail: `Call Record Event on delete (Record Pid: ${pid})`});
    });
  }
}
