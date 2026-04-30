/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoreConfigService, RecordService } from '@rero/ng-core';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { MenuItem, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { MenuComponent } from './menu/menu.component';
import { SearchBarComponent } from './search-bar/search-bar.component';

/**
 * Main component of the application.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [SearchBarComponent, RouterOutlet, NgxSpinnerComponent, MenuComponent, ConfirmDialog, Toast],
})
export class AppComponent {
  configService = inject(CoreConfigService);
  recordService: RecordService = inject(RecordService);
  messageService = inject(MessageService);

  // Available languages
  languages: string[] = [];

  // If navigation is collapsed or not.
  isCollapsed = true;

  // Application menu
  appMenu: MenuItem | undefined;

  // Application language menu
  languageMenu: MenuItem | undefined;
}
