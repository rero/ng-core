/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { TranslateModule } from '@ngx-translate/core';
import { TemplatesService } from './templates.service';
import { of } from 'rxjs';
import { RecordService } from '../../record.service';

describe('TemplatesService', () => {
  let service: TemplatesService;

  const recordServiceMock = jasmine.createSpyObj('recordService', ['getRecords']);
  recordServiceMock.getRecords.and.returnValue(of({
    hits: {
      total: 2,
      hits: [
        { metadata: { pid: 1, name: 'template 1' } },
        { metadata: { pid: 2, name: 'template 2' } }
      ]
    }
  }));

  const result = [
    { pid: 1, name: 'template 1' },
    { pid: 2, name: 'template 2' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule,
      ],
      providers: [
        { provide: RecordService, useValue: recordServiceMock }
      ]
    });

    service = TestBed.inject(TemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the list of templates', () => {
    service.getTemplates('documents').subscribe((templates: any) => {
      expect(templates).toEqual(result);
    });
  });
});
