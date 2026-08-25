// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Service } from '@angular/core';
import { CoreConfigService } from '@rero/ng-core';
import { environment } from '../environments/environment';

/**
 * Service for configuring the application.
 */
@Service()
export class AppConfigService extends CoreConfigService {
  /**
   * Constructor.
   */
  constructor() {
    super();
    this.production = false;
    this.projectTitle = environment.projectTitle;
    this.apiBaseUrl = environment.apiBaseUrl;
    this.schemaFormEndpoint = '/schemas';
    if (environment.$refPrefix) {
      this.$refPrefix = environment.$refPrefix;
    }
    this.translationsURLs = environment.translationsURLs;
  }
}
