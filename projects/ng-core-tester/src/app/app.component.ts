// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
