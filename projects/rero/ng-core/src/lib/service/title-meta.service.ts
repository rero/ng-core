/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

/**
 * Service for managin HTML meta and title.
 */
@Injectable({
  providedIn: 'root'
})
export class TitleMetaService {
  // Prefix.
  private _prefix = null;

  /**
   * Constructor
   * @param titleService - Title
   * @param metaService - Meta
   * @param translateService - TranslateService
   */
  constructor(
    private _titleService: Title,
    private _metaService: Meta,
    private _translateService: TranslateService
  ) { }

  /**
   * Prefix of title window
   * @param prefix - string
   * @return this
   */
  setPrefix(prefix?: string) {
    this._prefix = this._translateService.instant(prefix);

    return this;
  }

  /**
   * Title window <head>
   * @param title - sting
   * @return this
   */
  setTitle(title: string) {
    let pageTitle = '';
    if (this._prefix !== null) {
      pageTitle += this._prefix + ': ';
    }
    pageTitle += this._translateService.instant(title);
    this._titleService.setTitle(pageTitle);

    return this;
  }

  /**
   * Get Title
   * @return string
   */
  getTitle() {
    return this._titleService.getTitle();
  }

  /**
   * Meta window <head>
   * @param name - string
   * @param content - string
   * @return this
   */
  setMeta(name: string, content: string) {
    this._metaService.updateTag({name, content});

    return this;
  }

  /**
   * Get Meta with its name
   * @param name - string
   * @return string
   */
  getMeta(name: string) {
    return this._metaService.getTag(name);
  }
}
