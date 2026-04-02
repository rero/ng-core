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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultDetailComponent } from './default-detail.component';
import { CommonModule } from '@angular/common';

describe('DefaultDetailComponent', () => {
  let fixture: ComponentFixture<DefaultDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, DefaultDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DefaultDetailComponent);
    fixture.componentRef.setInput('record', { id: '123456', title: 'foo' });
    fixture.componentRef.setInput('type', 'documents');
    fixture.detectChanges();
  });

  it('should display data in json format', () => {
    expect(fixture.nativeElement.querySelector('h1').innerHTML).toContain('#123456');
    expect(fixture.nativeElement.querySelector('pre').innerHTML).toContain('foo');
  });
});
