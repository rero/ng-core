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
import { ModalModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { RecordUiService } from './record-ui.service';

describe('RecordUiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ToastrModule.forRoot(),
      ModalModule.forRoot(),
      TranslateModule.forRoot(),
      HttpClientModule,
      RouterTestingModule
    ]
  }));

  it('should be created', () => {
    const service: RecordUiService = TestBed.get(RecordUiService);
    expect(service).toBeTruthy();
  });
});
