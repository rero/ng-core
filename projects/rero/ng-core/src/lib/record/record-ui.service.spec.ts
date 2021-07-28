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
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { RecordUiService } from './record-ui.service';

describe('RecordUiService', () => {

  let service: RecordUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        TranslateModule.forRoot(),
        HttpClientModule,
        RouterTestingModule
      ]
    });
    service = TestBed.inject(RecordUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the default delete message', () => {
    service.deleteMessage$('1', 'holdings').subscribe((messages: string[]) => {
      expect(messages[0]).toEqual('Do you really want to delete this record?');
    });
  });

  it('Should return the default delete message with a defined type, but no message configuration', () => {
    service.types = [
      {
        key: 'holdings'
      }
    ];
    service.deleteMessage$('1', 'holdings').subscribe((messages: string[]) => {
      expect(messages[0]).toEqual('Do you really want to delete this record?');
    });
  });

  it('should return the custom delete message', () => {
    const messagesType = ['foo', 'bar'];
    service.types = [
      {
        key: 'holdings',
        deleteMessage: (pid: string) => {
          return of(messagesType);
        }
      }
    ];
    service.deleteMessage$('1', 'holdings').subscribe((messages: string[]) => {
      expect(messages).toEqual(messagesType);
    });
  });
});
