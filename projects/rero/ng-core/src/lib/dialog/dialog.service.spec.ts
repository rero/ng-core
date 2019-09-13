/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalModule, BsModalService } from 'ngx-bootstrap';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

import { DialogService } from './dialog.service';
import { DialogComponent } from './dialog.component';
import { Nl2brPipe } from '../pipe/nl2br.pipe';
import { CONFIG } from '../core.config';

let service: DialogService;
let bsModalService: BsModalService;

describe('DialogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalModule.forRoot(),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      declarations: [
        DialogComponent,
        Nl2brPipe
      ],
      providers: [
        { provide: CONFIG, useValue: {} }
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [DialogComponent],
      }
    }).compileComponents();

    service = TestBed.get(DialogService);
    bsModalService = TestBed.get(BsModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#show', () => {
    const config = {
      ignoreBackdropClick: true,
      initialState: {
        title: 'Confirmation',
        body: 'Exit without saving changes?',
        confirmButton: true
      }
    };

    service.show(config);

    expect(bsModalService.getModalsCount()).toBe(1);
  });
});
