// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CONFIG } from '@rero/ng-core';
import { MenuItem, MessageService } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { Menubar } from 'primeng/menubar';
import { Ripple } from 'primeng/ripple';
import { map } from 'rxjs';
import { AppUserService, UserInfo } from '../service/app-user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Menubar, Ripple, RouterLink, Badge, NgClass],
})
export class MenuComponent {
  messageService = inject(MessageService);
  translateService = inject(TranslateService);
  router = inject(Router);
  userService = inject(AppUserService);

  private currentLang: Signal<string> = toSignal(
    this.translateService.onLangChange.pipe(map((event) => event.lang)),
    { initialValue: this.translateService.getCurrentLang() },
  );

  private userInfo: Signal<UserInfo | undefined> = toSignal(this.userService.getUserInfo());

  menuItems: Signal<MenuItem[]> = computed(() => this.buildMenu(this.userInfo(), this.currentLang()));

  private buildMenu(userInfo: UserInfo | undefined, currentLang: string): MenuItem[] {
    const availableLanguages = userInfo?.settings.availableLanguages.map((l) => l.code) ?? [];

    return [
      {
        label: this.translateService.instant('home'),
        icon: 'fa-solid fa-house',
        command: () => {
          this.router.navigate(['/']);
          this.messageService.add({ severity: 'success', detail: 'Home menu selected', life: CONFIG.MESSAGE_LIFE });
        },
      },
      {
        label: this.translateService.instant('Records'),
        id: 'records',
        items: [
          {
            label: this.translateService.instant('Global records'),
            icon: 'fa-solid fa-book',
            routerLink: ['/record', 'search', 'documents'],
          },
          {
            label: this.translateService.instant('UNISI records'),
            icon: 'fa-solid fa-book',
            routerLink: ['/unisi', 'record', 'search', 'documents'],
          },
          {
            label: this.translateService.instant('Backend records'),
            icon: 'fa-solid fa-book',
            routerLink: ['/admin', 'record', 'search', 'documents'],
          },
          {
            label: this.translateService.instant('Documents'),
            icon: 'fa-solid fa-book',
            items: [
              {
                label: this.translateService.instant('Document records'),
                icon: 'fa-solid fa-book',
                routerLink: ['/records', 'documents'],
              },
              {
                label: this.translateService.instant('Document records with query params'),
                icon: 'fa-solid fa-book',
                routerLink: ['/records', 'documents'],
                queryParams: { q: 'anatomic', page: 1, size: 10 },
              },
            ],
          },
          {
            label: this.translateService.instant('Organisation'),
            icon: 'fa-solid fa-industry',
            routerLink: ['/records', 'organisations'],
          },
          {
            label: '',
            separator: true,
          },
          {
            label: this.translateService.instant('Editor'),
            icon: 'fa-solid fa-pen-to-square',
            items: [
              {
                label: this.translateService.instant('Long mode'),
                items: [
                  {
                    label: this.translateService.instant('Add mode'),
                    icon: 'fa-solid fa-circle-plus',
                    routerLink: ['/editor', 'demo'],
                  },
                  {
                    label: this.translateService.instant('Edit mode'),
                    icon: 'fa-solid fa-pencil',
                    routerLink: ['/editor', 'demo', '1'],
                  },
                ],
              },
              {
                label: this.translateService.instant('Simple mode'),
                items: [
                  {
                    label: this.translateService.instant('Add mode'),
                    icon: 'fa-solid fa-circle-plus',
                    routerLink: ['/editor', 'normal'],
                  },
                  {
                    label: this.translateService.instant('Edit mode'),
                    icon: 'fa-solid fa-pencil',
                    routerLink: ['/editor', 'normal', '1'],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: 'Rero website',
        id: 'rero_website',
        icon: 'fa-solid fa-up-right-from-square',
        url: 'https://www.rero.ch',
        target: '_blank',
      },
      {
        label: this.translateService.instant('Language'),
        id: 'language',
        icon: 'fa-solid fa-language',
        items: availableLanguages.map((language) => ({
          label: this.translateService.instant(language),
          id: language,
          styleClass: language === currentLang ? 'ui:font-bold' : '',
          command: () => {
            this.translateService.use(language);
            this.messageService.add({
              severity: 'info',
              detail: `Selected: ${this.translateService.instant(language)}`,
              summary: `Switch language`,
              life: CONFIG.MESSAGE_LIFE,
            });
          },
        })),
      },
    ];
  }
}
