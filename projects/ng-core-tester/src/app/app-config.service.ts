import { Injectable } from '@angular/core';
import { CoreConfigService } from '@rero/ng-core';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService extends CoreConfigService {
  constructor() {
    super();
    this.production = false;
    this.prefixWindow = environment.prefixWindow;
    this.apiBaseUrl = 'https://localhost:5000';
    this.schemaFormEndpoint = '/api/schemaform';
    this.$refPrefix = environment.$refPrefix;
    this.languages = environment.languages;
    this.customTranslations = environment.customTranslations;
  }
}
