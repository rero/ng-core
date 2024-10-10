/*
 * RERO angular core
 * Copyright (C) 2024 RERO
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
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CoreConfigService } from '@rero/ng-core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {

  messageService = inject(MessageService);
  translateService = inject(TranslateService);
  router = inject(Router);
  config = inject(CoreConfigService);

  menuItems: MenuItem[];

  ngOnInit(): void {
    this.menuItems = [
      {
        label: this.translateService.instant('home'),
        untranslatedLabel: 'home',
        icon: 'pi pi-home',
        command: () => {
          this.router.navigate(['/']);
          this.messageService.add({ severity: 'success', detail: 'Home menu selected', life: 2000 });
        }
      },
      {
        label: this.translateService.instant('Records'),
        untranslatedLabel: 'Records',
        id: 'records',
        items: [
          {
            label: this.translateService.instant('Global records'),
            untranslatedLabel: 'Global records',
            icon: 'fa fa-book',
            routerLink: ['/record', 'search', 'documents']
          },
          {
            label: this.translateService.instant('UNISI records'),
            untranslatedLabel: 'UNISI records',
            icon: 'fa fa-book',
            routerLink: ['/unisi', 'record', 'search', 'documents']
          },
          {
            label: this.translateService.instant('Backend records'),
            untranslatedLabel: 'Backend records',
            icon: 'fa fa-book',
            routerLink: ['/admin', 'record', 'search', 'documents']
          },
          {
            label: this.translateService.instant('Documents'),
            untranslatedLabel: 'Documents',
            icon: 'fa fa-book',
            items: [
              {
                label: this.translateService.instant('Document records'),
                untranslatedLabel: 'Document records',
                icon: 'fa fa-book',
                routerLink: ['/records', 'documents']
              },
              {
                label: this.translateService.instant('Document records with query params'),
                untranslatedLabel: 'Document records with query params',
                icon: 'fa fa-book',
                routerLink: ['/records', 'documents'],
                queryParams: { q: 'anatomic', page: 1, size: 10 }
              }
            ]
          },
          {
            label: this.translateService.instant('Organisation'),
            untranslatedLabel: 'Organisation',
            icon: 'fa fa-industry',
            routerLink: ['/records', 'organisations']
          },
          {
            separator: true
          },
          {
            label: this.translateService.instant('Editor'),
            untranslatedLabel: 'Editor',
            icon: 'fa fa-pencil-square-o',
            items: [
              {
                label: this.translateService.instant('Long mode'),
                items: [
                  {
                    label: this.translateService.instant('Add mode'),
                    untranslatedLabel: 'Add mode',
                    icon: 'fa fa-pencil-square-o',
                    routerLink: ['/editor', 'demo']
                  },
                  {
                    label: this.translateService.instant('Edit mode'),
                    untranslatedLabel: 'Edit mode',
                    icon: 'fa fa-pencil-square-o',
                    routerLink: ['/editor', 'demo', '1']
                  }
                ]
              },
              {
                label: this.translateService.instant('Simple mode'),
                items: [
                  {
                    label: this.translateService.instant('Add mode'),
                    untranslatedLabel: 'Add mode',
                    icon: 'fa fa-pencil-square-o',
                    routerLink: ['/editor', 'normal']
                  },
                  {
                    label: this.translateService.instant('Edit mode'),
                    untranslatedLabel: 'Edit mode',
                    icon: 'fa fa-pencil-square-o',
                    routerLink: ['/editor', 'normal', '1']
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        label: 'Rero website',
        id: 'rero_website',
        icon: 'fa fa-external-link',
        url: 'https://www.rero.ch',
        target: '_blank'
      },
      {
        label: this.translateService.instant('Language'),
        untranslatedLabel: 'Language',
        id: 'language',
        icon: 'fa fa-language',
        items: []
      }
    ];

    const languageMenu = this.menuItems.find((item: MenuItem) => item.id === 'language');
    this.config.languages.map((language: string) => {
      const lang = {
        label: this.translateService.instant(language),
        untranslatedLabel: language,
        id: language,
        styleClass: undefined,
        command: () => {
          this.translateService.use(language);
          this.messageService.add({ severity: 'info', detail: `Language change to ${language}`, life: 2000 });
        }
      }
      languageMenu.items.push(lang);
    });
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateItems(this.menuItems)
      languageMenu.items.map((item: MenuItem) => {
        item.styleClass = item.id === event.lang ? 'font-bold': ''
      });
    });
  }

  private translateItems(menuItems: MenuItem[]): void {
    menuItems.map((item: MenuItem) => {
      if (item.untranslatedLabel) {
        item.label = this.translateService.instant(item.untranslatedLabel);
      }
      if (item.items) {
        this.translateItems(item.items);
      }
    })
  }
}
