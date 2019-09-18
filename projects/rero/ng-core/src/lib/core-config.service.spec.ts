import { TestBed } from '@angular/core/testing';

import { CoreConfigService } from './core-config.service';

describe('CoreConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoreConfigService = TestBed.get(CoreConfigService);
    expect(service).toBeTruthy();
  });
});
