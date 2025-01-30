/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { JsonComponent } from "./json.component";
import { CommonModule } from "@angular/common";
import { of } from "rxjs";

describe('DetailButtonComponent', () => {
  let component: JsonComponent;
  let fixture: ComponentFixture<JsonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
      ],
      declarations: [
        JsonComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonComponent);
    component = fixture.componentInstance;
    component.record$ = of({
      id: '123456',
      title: 'foo'
    });
    component.type = 'documents';
    fixture.detectChanges();
  });

  it('should display data in json format', () => {
    expect(fixture.nativeElement.querySelector('h1').innerHTML).toContain('#123456');
    expect(fixture.nativeElement.querySelector('pre').innerHTML).toContain('foo');
  });
});
