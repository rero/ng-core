import { Injectable } from '@angular/core';

export interface Config {
  production?: boolean;
  apiBaseUrl?: string;
  apiEndpointPrefix?: string;
  $refPrefix: string;
  languages?: string[];
  defaultLanguage?: string;
  customTranslations?: {
      fr?: {},
      de?: {},
      en?: {},
      it?: {}
  };
}

@Injectable({
  providedIn: 'root'
})
export class CoreConfigService implements Config {
  production = false;
  apiBaseUrl = '';
  apiEndpointPrefix = '/api';
  $refPrefix = undefined;
  languages = ['en'];
  defaultLanguage = 'en';
  customTranslations = null;
}
