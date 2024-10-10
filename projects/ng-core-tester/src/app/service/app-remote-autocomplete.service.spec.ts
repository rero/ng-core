import { TestBed } from '@angular/core/testing';

import { AppRemoteAutocompleteService } from './app-remote-autocomplete.service';

describe('AppRemoteAutocompleteService', () => {
  let service: AppRemoteAutocompleteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppRemoteAutocompleteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
