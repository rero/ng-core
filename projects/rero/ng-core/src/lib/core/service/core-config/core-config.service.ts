// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Injectable } from '@angular/core';

/**
 * Translation file URL; `${lang}` is replaced by the requested language.
 *
 * A `versioned` URL points to a static file: it receives the
 * `translationsVersion` as query parameter and may be served from the
 * browser HTTP cache.
 */
export interface TranslationURL {
  url: string;
  versioned?: boolean;
}

/**
 * Interface for configuration.
 */
export interface Config {
  production?: boolean;
  projectTitle?: string;
  apiBaseUrl?: string;
  apiEndpointPrefix?: string;
  $refPrefix?: string;
  schemaFormEndpoint: string;
  defaultLanguage?: string;
  secretPassphrase: string;
  translationsURLs?: (string | TranslationURL)[];
  translationsVersion?: string;
  ngCoreAssetsUrl?: string;
}

/**
 * Service for managing configuration of the application.
 */
@Injectable({
  providedIn: 'root',
})
export class CoreConfigService implements Config {
  production = false;
  projectTitle: string | undefined = undefined;
  apiBaseUrl = '';
  apiEndpointPrefix = '/api';
  schemaFormEndpoint = '/api/schemaform';
  $refPrefix = '';
  defaultLanguage = 'en';
  secretPassphrase = 'ShERWIN53SnAggIng48rELAtiVes';
  translationsURLs: (string | TranslationURL)[] = [];
  translationsVersion = '';
  ngCoreAssetsUrl = '';
}
