// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { CoreConfigService } from './core-config.service';

describe('CoreConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoreConfigService = TestBed.inject(CoreConfigService);
    expect(service).toBeTruthy();
  });
});
