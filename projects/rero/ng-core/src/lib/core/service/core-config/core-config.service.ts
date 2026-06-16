// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Injectable } from '@angular/core';

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
  languages?: string[];
  defaultLanguage?: string;
  secretPassphrase: string;
  translationsURLs?: string[];
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
  languages = ['en'];
  defaultLanguage = 'en';
  secretPassphrase = 'ShERWIN53SnAggIng48rELAtiVes';
  translationsURLs: string[] = [];
}
