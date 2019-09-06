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
import { Component, OnInit, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CONFIG, Config } from '../core.config';

@Component({
  selector: 'invenio-core-dialog',
  templateUrl: './dialog.component.html'
})
export class DialogComponent implements OnInit {
  public title: string;
  public body: string;
  public confirmButton: boolean = true;
  public onClose: Subject<boolean>;

  constructor(private _bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.onClose = new Subject();
  }

  confirm(): void {
    this.onClose.next(true);
    this._bsModalRef.hide();
  }

  decline(): void {
    this.onClose.next(false);
    this._bsModalRef.hide();
  }
}
