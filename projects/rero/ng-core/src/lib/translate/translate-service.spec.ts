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
import { TestBed } from "@angular/core/testing";
import { NgCoreTranslateService } from "./translate-service";
import { PrimeNGConfig } from "primeng/api";
import { TranslateModule } from "@ngx-translate/core";
import moment from "moment";

describe('NgCoreTranslateService', () => {
  let service: NgCoreTranslateService;
  let primeConfig: PrimeNGConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        NgCoreTranslateService,
        PrimeNGConfig
      ]
    });
    service = TestBed.inject(NgCoreTranslateService);
    primeConfig = TestBed.inject(PrimeNGConfig);
    service.initialize();
  });

  it('should return the english translation (default)', () => {
    expect(primeConfig.translation.today).toEqual('Today');
  });

  it('should have changed the local service', () => {
    service.use('fr');
    expect(primeConfig.translation.today).toEqual("Aujourd'hui");
    expect(moment().locale()).toEqual('fr');
  });
});
