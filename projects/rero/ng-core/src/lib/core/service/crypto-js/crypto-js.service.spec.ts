// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { CryptoJsService } from './crypto-js.service';

describe('CryptoJsService', () => {
  let service: CryptoJsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should encrypt and decrypt data', () => {
    const data = 'The weather is good';
    const encrypted = service.encrypt(data);
    expect(service.decrypt(encrypted)).toEqual(data);
  });
});
