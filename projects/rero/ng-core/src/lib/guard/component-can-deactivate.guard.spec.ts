/*
 * RERO angular core
 * Copyright (C) 2023 RERO
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
import { TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { AbstractCanDeactivateComponent } from '../component/abstract-can-deactivate.component';
import { DialogService } from '../dialog/dialog.service';
import { ComponentCanDeactivateGuard } from './component-can-deactivate.guard';

export class MockComponent extends AbstractCanDeactivateComponent {
  canDeactivate: boolean = true;
}

describe('ComponentCanDeactivateGuard', () => {
  let guard: ComponentCanDeactivateGuard;
  let component: MockComponent;

  const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['show']);
  dialogServiceSpy.show.and.returnValue(of(false));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [
        MockComponent,
        ComponentCanDeactivateGuard,
        { provide: DialogService, useValue: dialogServiceSpy },
        BsModalService
      ]
    });
    guard = TestBed.inject(ComponentCanDeactivateGuard);
    component = TestBed.inject(MockComponent);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return a boolean if confirmation is not required.', () => {
    expect(guard.canDeactivate(component)).toBeTrue();
  });

  it('should return an observable on a boolean value.', () => {
    component.canDeactivate = false;
    const obs = guard.canDeactivate(component) as Observable<boolean>;
    obs.subscribe((value: boolean) => expect(value).toBeFalse());
  });
});
