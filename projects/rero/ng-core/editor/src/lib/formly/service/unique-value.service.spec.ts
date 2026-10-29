// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { RecordService } from '@rero/ng-core';
import { firstValueFrom, of } from 'rxjs';

import { UniqueValueService } from './unique-value.service';

describe('UniqueValueService', () => {
  let service: UniqueValueService;
  const valueAlreadyExists = vi.fn();

  const field = (value: unknown, model: unknown = {}): FormlyFieldConfig => ({
    key: 'name',
    formControl: new FormControl(value),
    model,
  });

  beforeEach(() => {
    valueAlreadyExists.mockReset().mockReturnValue(of(null));
    TestBed.configureTestingModule({
      providers: [{ provide: RecordService, useValue: { valueAlreadyExists } }],
    });
    service = TestBed.inject(UniqueValueService);
  });

  it('should be valid without querying when the value is empty', async () => {
    expect(await firstValueFrom(service.uniqueValue(field(null), 'documents'))).toBe(true);
    expect(valueAlreadyExists).not.toHaveBeenCalled();
  });

  it('should be valid when the value is not in the limited values', async () => {
    const result = await firstValueFrom(service.uniqueValue(field('foo'), 'documents', undefined, undefined, ['bar']));
    expect(result).toBe(true);
    expect(valueAlreadyExists).not.toHaveBeenCalled();
  });

  it('should check a limited value containing quotes', async () => {
    await firstValueFrom(service.uniqueValue(field('a"b'), 'documents', undefined, undefined, ['a"b']));
    expect(valueAlreadyExists).toHaveBeenCalledWith('documents', 'name', 'a"b', undefined, undefined);
  });

  it('should check the value with the term, the evaluated filter and the excluded pid', async () => {
    const model = { library: { $ref: 'https://localhost/api/libraries/1' } };
    await firstValueFrom(
      service.uniqueValue(field('foo', model), 'documents', '42', 'title', [], "'library.pid:' + model.library.pid"),
    );
    expect(valueAlreadyExists).toHaveBeenCalledWith('documents', 'title', 'foo', '42', 'library.pid:1');
  });
});
