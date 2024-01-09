/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

/**
 * Show dialog modal
 */
@Component({
  selector: 'ng-core-dialog',
  templateUrl: './dialog.component.html'
})
export class DialogComponent implements OnInit {
  // Title of the modal.
  title: string;

  // Content of the modal, can be html.
  body: string;

  // Show button to confirm action.
  confirmButton = true;

  // Label of cancel button.
  cancelTitleButton = 'Cancel';

  // Label of confirmation button.
  confirmTitleButton = 'OK';

  // Event triggered when modal is closed.
  onClose: Subject<boolean>;

  /**
   * Constructor
   * @param bsModalRef - BsModalRef, reference to modal
   */
  constructor(private bsModalRef: BsModalRef) { }

  /**
   * Component init
   *
   * Initializes subject when the dialog is closed.
   */
  ngOnInit() {
    this.onClose = new Subject();
  }

  /**
   * Confirm action.
   */
  confirm() {
    this.onClose.next(true);
    this.bsModalRef.hide();
  }

  /**
   * Cancel action
   */
  decline() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }
}
