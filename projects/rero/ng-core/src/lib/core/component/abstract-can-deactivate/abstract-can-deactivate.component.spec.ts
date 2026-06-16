// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractCanDeactivateComponent } from './abstract-can-deactivate.component';
import { CommonModule } from '@angular/common';

export class CanDeactivateComponent extends AbstractCanDeactivateComponent {
  canDeactivate = false;
}
describe('AbstractCanDeactivateComponent', () => {
  let component: CanDeactivateComponent;
  let fixture: ComponentFixture<CanDeactivateComponent>;

  const event = {
    returnValue: false,
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule, CanDeactivateComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanDeactivateComponent);
    component = fixture.componentInstance;
  });

  it('should return canDeactivate value', () => {
    component.canDeactivateChanged(true);
    component.unloadNotification(event as any);
    expect(event.returnValue).toBe(false);
  });
});
