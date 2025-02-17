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
import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({
    selector: '[ngVar]',
    standalone: false
})
export class NgVarDirective {

  protected vcRef: ViewContainerRef = inject(ViewContainerRef);
  protected templateRef: TemplateRef<any> = inject(TemplateRef);

  /** Context */
  public context: any = {};

  @Input()
  set ngVar(context: any) {
    this.context.$implicit = this.context.ngVar = context;
    this.updateView();
  }

  /** Update view */
  private updateView() {
    this.vcRef.clear();
    this.vcRef.createEmbeddedView(this.templateRef, this.context);
  }
}
