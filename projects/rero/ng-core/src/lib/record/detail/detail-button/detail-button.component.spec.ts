/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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

import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ButtonModule } from "primeng/button";
import { DetailButtonComponent } from "./detail-button.component";
import { TranslateModule } from "@ngx-translate/core";
import { By } from "@angular/platform-browser";
import { ComponentRef } from "@angular/core";
import { TooltipModule } from "primeng/tooltip";

describe('DetailButtonComponent', () => {
  let component: DetailButtonComponent;
  let fixture: ComponentFixture<DetailButtonComponent>;
  let componentRef: ComponentRef<DetailButtonComponent>;

  const useAction = { can: true, message: 'Use enabled', url: '/foo' }
  const action = { can: true, message: '' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ButtonModule,
        TooltipModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        DetailButtonComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailButtonComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('record', { metadata: { title: 'Foo' }})
    fixture.detectChanges();
  });

  it('should display only the default back button', () => {
    expect(fixture.debugElement.query(By.css('#detail-back-button'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-use-button'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-edit-button'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-delete-button'))).toBeNull();
  });

  it('should not show buttons without admin mode', () => {
    componentRef.setInput('useStatus', useAction);
    componentRef.setInput('deleteStatus', action);
    componentRef.setInput('updateStatus', action);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#detail-use-button'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-edit-button'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-delete-button'))).toBeNull();
  });

  it('should show buttons with admin mode enabled', () => {
    componentRef.setInput('adminMode', action);
    componentRef.setInput('useStatus', useAction);
    componentRef.setInput('deleteStatus', action);
    componentRef.setInput('updateStatus', action);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#detail-use-button'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-edit-button'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-delete-button'))).not.toBeNull();
  });
});
