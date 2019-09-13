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
import { Component, OnInit, Input } from '@angular/core';

import { AlertService } from './alert.service';

@Component({
  selector: 'ng-core-alert',
  templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {
  public alerts: any[] = [];

  private _timeout = 5000;

  @Input()
  set timeout(timeout: number) {
    if (timeout < 0) {
      timeout = 5000;
    }

    this._timeout = timeout;
  }
  get timeout() {
    return this._timeout;
  }

  constructor(
    private alertsService: AlertService
  ) { }

  ngOnInit() {
    this.alertsService.alert.subscribe(alert => {
      if (alert) {
        this.addAlert(alert.type, alert.message);
      }
    });
  }

  onAlertClosed(indexToRemove: number): void {
    this.alerts = this.alerts.filter((alert, index: number) => index !== indexToRemove);

  }

  addAlert(type: string, message: string) {
    this.alerts.push({
      type,
      message,
      timeout: this._timeout
    });
  }

}
