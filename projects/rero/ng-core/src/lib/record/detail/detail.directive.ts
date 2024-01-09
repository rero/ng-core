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
import { Directive, Input, ViewContainerRef } from '@angular/core';

/**
 * Directive for displaying a record detail.
 */
@Directive({
    selector: '[ngCoreRecordDetail]',
})
export class RecordDetailDirective {
    /**
     * Record to display
     */
    @Input() record: object = {};

    /**
     * Type of resource
     */
    @Input() type: string;

    /**
     * Constructor.
     *
     * @param viewContainerRef View container reference
     */
    constructor(private _viewContainerRef: ViewContainerRef) { }

    /**
     * Returns view container reference.
     */
    get viewContainerRef(): ViewContainerRef {
      return this._viewContainerRef;
    }
}
