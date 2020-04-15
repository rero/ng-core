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
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RecordModule } from '@rero/ng-core';

/**
 * Module used to wrap record module of ng-core for using it in routes lazy
 * loading.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RecordModule
  ]
})
export class RecordWrapperModule { }
