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
import { TranslateModule } from "@ngx-translate/core";
import { DateTime } from "luxon";
import { PrimeNG } from "primeng/config";
import { NgCoreTranslateService } from "./translate-service";

describe('NgCoreTranslateService', () => {
  let service: NgCoreTranslateService;
  let primeConfig: PrimeNG;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        NgCoreTranslateService,
        PrimeNG
      ]
    });
    service = TestBed.inject(NgCoreTranslateService);
    primeConfig = TestBed.inject(PrimeNG);
    service.initialize();
  });

  it('should return the english translation (default)', () => {
    expect(primeConfig.translation.today).toEqual('Today');
  });

  it('should have changed the local service', () => {
    service.use('fr');
    expect(primeConfig.translation.today).toEqual("Aujourd'hui");
    expect(DateTime.locale).toEqual('fr');
  });
});
