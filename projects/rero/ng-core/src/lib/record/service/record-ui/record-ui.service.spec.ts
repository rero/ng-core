// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Location } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { of } from 'rxjs';

import { RecordData } from '../../../model/record.interface';
import { RecordType } from '../../model';
import { RecordUiService } from './record-ui.service';

@Component({ template: '' })
class PageComponent {}

describe('RecordUiService', () => {
  let service: RecordUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConfirmationService,
        MessageService,
        provideHttpClient(withInterceptorsFromDi()),
        provideLocationMocks(),
        provideRouter([
          { path: ':type', component: PageComponent },
          { path: ':type/detail/:pid', component: PageComponent },
          { path: ':type/edit/:pid', component: PageComponent },
          { path: ':type/new', component: PageComponent },
        ]),
        provideTranslateService(),
      ],
    });
    service = TestBed.inject(RecordUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the default delete message', () => {
    expect(service.deleteMessage('1')[0]).toEqual('Do you really want to delete this record?');
  });

  it('Should return the default delete message with a defined type, but no message configuration', () => {
    expect(service.deleteMessage('1', { key: 'holdings' } as any)[0]).toEqual(
      'Do you really want to delete this record?',
    );
  });

  it('should return the custom delete message', () => {
    const messagesType = ['foo', 'bar'];
    expect(
      service.deleteMessage('1', {
        key: 'holdings',
        deleteMessage: () => {
          return messagesType;
        },
      } as any),
    ).toEqual(messagesType);
  });

  describe('redirectAfterSave', () => {
    const items = { key: 'items', redirectUrl: () => of('/docs/detail/5') };
    const itemsWithoutRedirect = { key: 'items', redirectUrl: () => of(null as unknown as string) };
    const itemsToSearch = { key: 'items', redirectUrl: () => of('/docs?q=new') };

    afterEach(() => vi.restoreAllMocks());

    /** Open the pages, then save in the last one (the editor): returns 'back', the URL replacing the editor, or null. */
    async function save(action: string, config: Partial<RecordType> | null, urls: string[]): Promise<string | null> {
      const router = TestBed.inject(Router);
      for (const url of urls) {
        await router.navigateByUrl(url);
      }
      // The browser history holds the opened pages, the editor being the current one.
      const entries = urls.map(
        (url, index) => ({ index, url: window.location.origin + url }) as NavigationHistoryEntry,
      );
      vi.spyOn(window.navigation, 'entries').mockReturnValue(entries);
      vi.spyOn(window.navigation, 'currentEntry', 'get').mockReturnValue(entries.at(-1)!);
      const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      const back = vi.spyOn(TestBed.inject(Location), 'back');
      const record = { id: '1', metadata: {} } as RecordData;
      service.redirectAfterSave('1', record, config, action, router.routerState.root.firstChild!);
      if (back.mock.calls.length > 0) {
        return 'back';
      }
      const [url, extras] = navigateByUrl.mock.calls[0] ?? [];
      if (url) {
        expect(extras).toEqual({ replaceUrl: true });
      }
      return url?.toString() ?? null;
    }

    it.each([
      ['show the detail after an update', 'update', null, ['/docs', '/docs/edit/1'], '/docs/detail/1'],
      [
        'show the redirect URL after an update',
        'update',
        items,
        ['/items/detail/1', '/items/edit/1'],
        '/docs/detail/5',
      ],
      ['go back to the detail if edited from it', 'update', null, ['/docs/detail/1', '/docs/edit/1'], 'back'],
      ['go back to the detail whatever its tab', 'update', null, ['/docs/detail/1?tab=x', '/docs/edit/1'], 'back'],
      ['show the detail after a creation', 'create', null, ['/docs', '/docs/new'], '/docs/detail/1'],
      ['show the redirect URL after a creation', 'create', items, ['/items', '/items/new'], '/docs/detail/5'],
      ['go back to the redirect URL if created from it', 'create', items, ['/docs/detail/5', '/items/new'], 'back'],
      ['go back to the redirect URL with its query', 'create', itemsToSearch, ['/docs?q=new', '/items/new'], 'back'],
      [
        'show the redirect URL with another query',
        'create',
        itemsToSearch,
        ['/docs?q=old', '/items/new'],
        '/docs?q=new',
      ],
      ['not navigate when the redirect URL is null', 'create', itemsWithoutRedirect, ['/items', '/items/new'], null],
    ])('should %s', async (_, action, config, urls, expected) => {
      expect(await save(action, config, urls)).toBe(expected);
    });
  });
});
