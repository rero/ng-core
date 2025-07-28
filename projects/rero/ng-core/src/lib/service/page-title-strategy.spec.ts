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

import { DOCUMENT } from "@angular/common";
import { Component } from "@angular/core";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { provideRouter, Router, TitleStrategy } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CoreConfigService } from "../core-config.service";
import { PageTitleStrategy } from "./page-title-strategy";

@Component({template: ''})
export class TestComponent {
}

describe('PageTitleStrategy', () => {
  let translate: TranslateService;
  let config: CoreConfigService;
  let router: Router;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        { provide: TitleStrategy, useClass: PageTitleStrategy },
        TranslateService,
        CoreConfigService,
      ]
    });
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('fr', {
      'doc': 'Documents'
    });
    translate.use('fr');
    config = TestBed.inject(CoreConfigService);
    router = TestBed.inject(Router);
    router.config = [
      {
        path: 'home',
        component: TestComponent,
        title: 'doc'
      }
    ];
    document = TestBed.inject(DOCUMENT);
  });

  it('should have a dash as the window title with the Prefix', fakeAsync(() => {
    config.projectTitle = undefined;
    delete router.config[0].title;
    router.navigate(['/home']);
    tick();
    expect(document.title).toBe('-');
  }));

  it('should display the project name only', fakeAsync(() => {
    config.projectTitle = 'admin';
    delete router.config[0].title;
    router.navigate(['/home']);
    tick();
    expect(document.title).toBe('admin');
  }));

  it('should have the translated window title without the Prefix', fakeAsync(() => {
    config.projectTitle = undefined;
    router.navigate(['/home']);
    tick();
    expect(document.title).toBe('Documents');
  }));

  it('should have the translated window title with the Prefix', fakeAsync(() => {
    config.projectTitle = 'Website';
     router.navigate(['/home']);
    tick();
    expect(document.title).toBe('Documents | Website');
  }));
});
