/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from './alert.component';
import { AlertService } from './alert.service';
import { AlertModule } from 'ngx-bootstrap';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let alertService: AlertService;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AlertModule.forRoot()
      ],
      declarations: [
        AlertComponent
      ],
      providers: [
        AlertService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    alertService = TestBed.get(AlertService);
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add alert', () => {
    component.timeout = 100;

    const expectedAlert = { type: 'success', message: 'Success message !', timeout: component.timeout };
    component.addAlert(expectedAlert.type, expectedAlert.message);

    expect(component.alerts[component.alerts.length-1]).toEqual(expectedAlert);
  })

  it('should have an alert on init', () => {
    const expectedAlert = { type: 'warning', message: 'Message onInit call', timeout: component.timeout };
    alertService.addAlert(expectedAlert.type, expectedAlert.message);
    
    expect(component.alerts[component.alerts.length-1]).toEqual(expectedAlert);
  })

  it('should close an alert', () => {
    const expectedAlert = { type: 'success', message: 'Success message !', timeout: component.timeout };
    alertService.addAlert(expectedAlert.type, expectedAlert.message);
    
    component.onAlertClosed(0);

    expect(component.alerts.length).toBe(0);
  })

  it('should set default timeout value to 5000 if given is under 0', () => {
    component.timeout = -1000;
    fixture.detectChanges();
    expect(component.timeout).toBe(5000);
  })
});
