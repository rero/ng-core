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
import { TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TitleMetaService } from './title-meta.service';

describe('TitleMetaService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
      })
    ]
  }));

  it('should be created', () => {
    const service: TitleMetaService = TestBed.get(TitleMetaService);
    expect(service).toBeTruthy();
  });

  it('should be set title', () => {
    const service: TitleMetaService = TestBed.get(TitleMetaService);
    service.setTitle('my title');
    expect(service.getTitle()).toEqual('my title');
  });

  it('should be set title with prefix', () => {
    const service: TitleMetaService = TestBed.get(TitleMetaService);
    service.setPrefix('my app').setTitle('my title');
    expect(service.getTitle()).toEqual('my app: my title');
  });

  it('should be set title', () => {
    const service: TitleMetaService = TestBed.get(TitleMetaService);
    service.setMeta('description', 'my description');
    expect(service.getMeta('name=description').content).toEqual('my description');
  });
});
