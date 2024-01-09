/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
 * Service for managing HTML meta and title.
 */
@Injectable({
  providedIn: 'root'
})
export class TitleMetaService {
  // Prefix.
  private prefix = null;

  /**
   * Constructor
   * @param titleService - Title
   * @param metaService - Meta
   * @param translateService - TranslateService
   */
  constructor(
    private titleService: Title,
    private metaService: Meta,
    private translateService: TranslateService
  ) { }

  /**
   * Prefix of title window
   * @param prefix - string
   * @return this
   */
  setPrefix(prefix?: string) {
    this.prefix = this.translateService.instant(prefix);

    return this;
  }

  /**
   * Title window <head>
   * @param title - sting
   * @return this
   */
  setTitle(title: string) {
    let pageTitle = '';
    if (this.prefix !== null) {
      pageTitle += this.prefix + ': ';
    }
    pageTitle += this.translateService.instant(title);
    this.titleService.setTitle(pageTitle);

    return this;
  }

  /**
   * Get Title
   * @return string
   */
  getTitle() {
    return this.titleService.getTitle();
  }

  /**
   * Meta window <head>
   * @param name - string
   * @param content - string
   * @return this
   */
  setMeta(name: string, content: string) {
    this.metaService.updateTag({name, content});

    return this;
  }

  /**
   * Get Meta with its name
   * @param name - string
   * @return string
   */
  getMeta(name: string) {
    return this.metaService.getTag(name);
  }
}
