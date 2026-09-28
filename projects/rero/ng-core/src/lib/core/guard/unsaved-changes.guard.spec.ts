// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { provideTranslateService } from '@ngx-translate/core';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { Subject } from 'rxjs';
import { AbstractUnsavedChangesComponent } from '../component/abstract-unsaved-changes/abstract-unsaved-changes.component';
import { DialogComponent } from '../component/dialog/dialog.component';
import { unsavedChangesGuard } from './unsaved-changes.guard';

class MockComponent extends AbstractUnsavedChangesComponent {
  canDeactivate = true;
}

describe('unsavedChangesGuard', () => {
  let component: MockComponent;
  let onClose: Subject<boolean>;
  let dialogServiceOpen: ReturnType<typeof vi.fn>;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(
        component,
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

  beforeEach(() => {
    onClose = new Subject<boolean>();
    dialogServiceOpen = vi.fn(() => ({ onClose }));
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), { provide: DialogService, useValue: { open: dialogServiceOpen } }],
    });
    component = new MockComponent();
  });

  it('should return true if confirmation is not required', () => {
    expect(runGuard()).toBe(true);
    expect(dialogServiceOpen).not.toHaveBeenCalled();
  });

  it('should open a confirmation dialog and return its close observable', () => {
    component.canDeactivate = false;
    expect(runGuard()).toBe(onClose);
    expect(dialogServiceOpen).toHaveBeenCalledWith(DialogComponent, expect.objectContaining({ modal: true }));
  });
});
