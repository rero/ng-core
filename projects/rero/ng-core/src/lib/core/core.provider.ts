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

import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from "@angular/core";
import { TitleStrategy } from "@angular/router";
import { FORMLY_CONFIG, provideFormlyCore } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { registerNgCoreFormlyExtension } from "../formly/config/extensions";
import { withNgCoreFormly } from "../formly/config/formly-config";
import { NgCoreTranslateService } from "../translate/service/translate/translate-service";
import { PageTitleStrategy } from "./service/page-title-strategy/page-title-strategy";

export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders(
    [
      ConfirmationService,
      DialogService,
      MessageService,
      provideFormlyCore(withNgCoreFormly()),
      provideEnvironmentInitializer(() => {
        inject(NgCoreTranslateService).initialize();
      }),
      {
        provide: FORMLY_CONFIG,
        multi: true,
        useFactory: registerNgCoreFormlyExtension,
        deps: [TranslateService]
      },
      {
        provide: TitleStrategy,
        useClass: PageTitleStrategy
      },
      {
        provide: TranslateService,
        useClass: NgCoreTranslateService
      }
    ]
  );

};
