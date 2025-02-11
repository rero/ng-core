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
import { AfterContentChecked, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ngCoreAutofocus]'
})
export class AutofocusDirective implements AfterContentChecked {

  protected elementRef: ElementRef = inject(ElementRef);

  ngAfterContentChecked(){
    this.elementRef.nativeElement.autofocus = true;
    this.elementRef.nativeElement.focus();
  }
}
