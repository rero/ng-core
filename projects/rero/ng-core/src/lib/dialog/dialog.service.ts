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
import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DialogComponent } from './dialog.component';

/**
 * Service for displaying a dialog box.
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  /**
   *
   * @param modalService Bootstrap modal service.
   */
  constructor(private modalService: BsModalService) { }

  /**
   * Show the dialog box configured by the given config.
   *
   * @param config Configuration object.
   */
  show(config: any) {
    const bsModalRef = this.modalService.show(DialogComponent, config);
    return bsModalRef.content.onClose;
  }
}
