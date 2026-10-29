// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfigOption, FORMLY_CONFIG } from '@ngx-formly/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideCore } from '@rero/ng-core';

import { provideCoreFormly } from './formly.provider';

describe('provideCoreFormly', () => {
  // Each provider of the multi token holds one config or an array of configs.
  const flatten = (configs: (ConfigOption | ConfigOption[])[] | null): ConfigOption[] => (configs ?? []).flat();
  const typeNames = (configs: (ConfigOption | ConfigOption[])[] | null): string[] =>
    flatten(configs)
      .flatMap((config) => config.types ?? [])
      .map((type) => type.name);

  it('should register the ng-core field types and validation messages', () => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideCore(), provideCoreFormly()],
    });
    const configs = TestBed.inject(FORMLY_CONFIG);

    expect(typeNames(configs)).toEqual(expect.arrayContaining(['input', 'markdown', 'passwordGenerator']));
    expect(
      flatten(configs)
        .flatMap((config) => config.validationMessages ?? [])
        .map((m) => m.name),
    ).toContain('required');
  });

  it('should not register Formly with provideCore only', () => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideCore()],
    });

    expect(TestBed.inject(FORMLY_CONFIG, null)).toBeNull();
  });

  it('should register Formly in a child injector, as for a route', () => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideCore()],
    });
    const routeInjector = createEnvironmentInjector([provideCoreFormly()], TestBed.inject(EnvironmentInjector));

    expect(typeNames(routeInjector.get(FORMLY_CONFIG))).toContain('input');
    expect(TestBed.inject(FORMLY_CONFIG, null)).toBeNull();
  });

  it('should require provideCore', () => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideCoreFormly()],
    });

    expect(() => TestBed.inject(FORMLY_CONFIG)).toThrow(/requires provideCore/);
  });
});
