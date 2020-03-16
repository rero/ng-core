import { TestBed } from '@angular/core/testing';

import { RecordSearchService } from './record-search.service';

describe('RecordSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RecordSearchService = TestBed.get(RecordSearchService);
    expect(service).toBeTruthy();
  });
});
