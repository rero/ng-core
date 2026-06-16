// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RecordUiService } from './record-ui.service';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('RecordUiService', () => {
  let service: RecordUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterModule.forRoot([])],
      providers: [ConfirmationService, MessageService, provideHttpClient(withInterceptorsFromDi())],
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
    expect(service.deleteMessage('1', { key: 'holdings' } as any)[0]).toEqual('Do you really want to delete this record?');
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
});
