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

import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { AbstractCanDeactivateComponent } from "./abstract-can-deactivate.component";
import { CommonModule } from "@angular/common";

export class CanDeactivateComponent extends AbstractCanDeactivateComponent {
  canDeactivate = false;
};

describe('AbstractCanDeactivateComponent', () => {
  let component: CanDeactivateComponent;
  let fixture: ComponentFixture<CanDeactivateComponent>;

  const event = {
    returnValue: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule
      ],
      declarations: [CanDeactivateComponent],
    })
    .compileComponents()
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanDeactivateComponent);
    component = fixture.componentInstance;
  });

  it('should return canDeactivate value', () => {
    component.canDeactivateChanged(true);
    component.unloadNotification(event);
    expect(event.returnValue).toBeFalse();
  });
});
