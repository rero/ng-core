// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractUnsavedChangesComponent } from './abstract-unsaved-changes.component';

@Component({
  template: '',
})
class UnsavedChangesComponent extends AbstractUnsavedChangesComponent {
  canDeactivate = false;
}

describe('AbstractUnsavedChangesComponent', () => {
  let component: UnsavedChangesComponent;
  let fixture: ComponentFixture<UnsavedChangesComponent>;

  const dispatchBeforeUnload = (): Event => {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UnsavedChangesComponent],
    });
    fixture = TestBed.createComponent(UnsavedChangesComponent);
    component = fixture.componentInstance;
  });

  it('should prevent the window unload while changes are unsaved', () => {
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
  });

  it('should allow the window unload once deactivation is allowed', () => {
    component.canDeactivateChanged(true);
    expect(component.canDeactivate).toBe(true);
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });
});
