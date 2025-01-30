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

import { Component, ElementRef, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AutofocusDirective } from "./autofocus.directive";
import { By } from "@angular/platform-browser";

@Component({
  template: `<input type="text" [ngCoreAutofocus] />`
})
class AutoFocusComponent {}

export class MockElementRef extends ElementRef { }

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<AutoFocusComponent>;
  let input: ElementRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AutofocusDirective,
        AutoFocusComponent
      ],
      providers: [
        { provide: ElementRef, useClass: MockElementRef }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoFocusComponent);
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input'));
  });

  it('should return true if autofocus is present', () => {
    expect(input.nativeElement.autofocus).toBeTrue();
  });
});

