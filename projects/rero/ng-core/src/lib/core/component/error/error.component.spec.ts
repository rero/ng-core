/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { TranslateModule } from '@ngx-translate/core';
import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [
        TranslateModule.forRoot(),
        ErrorComponent
    ]
})
      
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('error', { title: 'Error', status: 500 });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display values on html', () => {
    expect(fixture.debugElement.nativeElement.querySelector('span').innerHTML).toContain(component.error().status);
    expect(fixture.debugElement.nativeElement.querySelector('p').innerHTML).toContain(component.error().title);
    expect(fixture.debugElement.nativeElement.querySelector('h5').innerHTML).toContain('You cannot access this page.');

    const message = 'Error message';
    fixture.componentRef.setInput('error', { title: 'Error', message: message, status: 500 });
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector('h5').innerHTML).toContain(message);
  });
});
