/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Injectable } from '@angular/core';

/**
 * Interface for configuration.
 */
export interface Config {
  production?: boolean;
  projectTitle?: string;
  apiBaseUrl?: string;
  apiEndpointPrefix?: string;
  $refPrefix: string;
  schemaFormEndpoint: string;
  languages?: string[];
  defaultLanguage?: string;
  secretPassphrase: string;
  translationsURLs?: any[];
}

/**
 * Service for managing configuration of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class CoreConfigService implements Config {
  production = false;
  projectTitle;
  apiBaseUrl = '';
  apiEndpointPrefix = '/api';
  schemaFormEndpoint = '/api/schemaform';
  $refPrefix;
  languages = ['en'];
  defaultLanguage = 'en';
  secretPassphrase = 'ShERWIN53SnAggIng48rELAtiVes';
  translationsURLs = [];
}
