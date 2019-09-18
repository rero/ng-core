/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { NgModule } from '@angular/core';
import { TranslateModule, TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';

import { SharedModule } from './shared.module';
import { TranslateLoader } from './translate/translate-loader';


@NgModule({
  imports: [
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: BaseTranslateLoader,
        useClass: TranslateLoader,
      },
      isolate: false
    })
  ]
})
export class CoreModule {}
