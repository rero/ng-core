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

import { Component, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageTitleStrategy } from './page-title-strategy';
import { CoreConfigService } from '../core-config/core-config.service';

@Component({ template: '' })
export class TestComponent {}

describe('PageTitleStrategy', () => {
  let translate: TranslateService;
  let config: CoreConfigService;
  let router: Router;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: TitleStrategy, useClass: PageTitleStrategy },
        TranslateService,
        CoreConfigService,
      ],
    });
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('fr', {
      doc: 'Documents',
    });
    translate.use('fr');
    config = TestBed.inject(CoreConfigService);
    router = TestBed.inject(Router);
    router.config = [
      {
        path: 'home',
        component: TestComponent,
        title: 'doc',
      },
    ];
    document = TestBed.inject(DOCUMENT);
  });

  it('should have a dash as the window title with the Prefix', async () => {
    config.projectTitle = undefined;
    delete router.config[0].title;
    await router.navigate(['/home']);
    expect(document.title).toBe('-');
  });

  it('should display the project name only', async () => {
    config.projectTitle = 'admin';
    delete router.config[0].title;
    await router.navigate(['/home']);
    expect(document.title).toBe('admin');
  });

  it('should have the translated window title without the Prefix', async () => {
    config.projectTitle = undefined;
    await router.navigate(['/home']);
    expect(document.title).toBe('Documents');
  });

  it('should have the translated window title with the Prefix', async () => {
    config.projectTitle = 'Website';
    await router.navigate(['/home']);
    expect(document.title).toBe('Documents | Website');
  });
});
