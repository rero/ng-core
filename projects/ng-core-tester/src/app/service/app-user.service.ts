// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface AvailableLanguage {
  code: string;
  name: string;
}

export interface UserSettings {
  language: string;
  availableLanguages: AvailableLanguage[];
}

export interface UserInfo {
  settings: UserSettings;
}

@Injectable({ providedIn: 'root' })
export class AppUserService {
  getUserInfo(): Observable<UserInfo> {
    return of({
      settings: {
        language: 'en',
        availableLanguages: [
          { code: 'en', name: 'English' },
          { code: 'fr', name: 'French' },
          { code: 'de', name: 'German' },
          { code: 'it', name: 'Italian' },
        ],
      },
    });
  }
}
