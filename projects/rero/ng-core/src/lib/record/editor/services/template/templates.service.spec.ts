// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TemplatesService } from './templates.service';
import { of } from 'rxjs';
import { RecordService } from '../../../service/record/record.service';

describe('TemplatesService', () => {
  let service: TemplatesService;

  const recordServiceMock = {
    getRecords: vi.fn().mockName('recordService.getRecords'),
  };
  recordServiceMock.getRecords.mockReturnValue(
    of({
      hits: {
        total: 2,
        hits: [{ metadata: { pid: 1, name: 'template 1' } }, { metadata: { pid: 2, name: 'template 2' } }],
      },
    }),
  );

  const result = [
    { pid: 1, name: 'template 1' },
    { pid: 2, name: 'template 2' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: RecordService, useValue: recordServiceMock }, provideHttpClient(withInterceptorsFromDi())],
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
