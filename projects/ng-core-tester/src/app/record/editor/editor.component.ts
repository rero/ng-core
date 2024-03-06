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
import { AfterContentChecked, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit, AfterContentChecked {

  /* form initial values */
  model = {};

  /* Model to display on the top of the form */
  modelDisplay = {};

  /** Edit or New mode */
  mode: 'Edit' | 'New' = 'New';

  /**
   * Constructor
   * @param route - ActivatedRoute
   */
  constructor(private route: ActivatedRoute) {}

  /** OnInit hook */
  ngOnInit(): void {
    this.mode = 'pid' in this.route.snapshot.params ? 'Edit' : 'New';
  }

  /** after content checked hook */
  ngAfterContentChecked(): void {
    this.modelDisplay = JSON.stringify(this.model, null, 2);
  }

  /** Callback when the model values has changed.
   * @param value - object the new model values
   */
  modelChanged(value: object) {
    this.model = value;
  }
}
