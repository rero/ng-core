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
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ng-core-dialog',
  templateUrl: './dialog.component.html'
})
/**
 * Show dialog modal
 */
export class DialogComponent implements OnInit {
  /**
   * Title of the modal.
   */
  public title: string;

  /**
   * Content of the modal, can be html.
   */
  public body: string;

  /**
   * Show button to confirm action.
   */
  public confirmButton = true;

  /**
   * Label of cancel button
   */
  public cancelTitleButton: string;

  /**
   * Label of confirmation button
   */
  public confirmTitleButton: string;

  /**
   * Event triggered when modal is closed.
   */
  public onClose: Subject<boolean>;

  /**
   * Constructor
   * @param _bsModalRef - BsModalRef, reference to modal
   */
  constructor(private _bsModalRef: BsModalRef) { }

  /**
   * Component init
   */
  ngOnInit() {
    this.onClose = new Subject();
  }

  /**
   * Confirm action.
   */
  confirm(): void {
    this.onClose.next(true);
    this._bsModalRef.hide();
  }

  /**
   * Cancel action
   */
  decline(): void {
    this.onClose.next(false);
    this._bsModalRef.hide();
  }
}
