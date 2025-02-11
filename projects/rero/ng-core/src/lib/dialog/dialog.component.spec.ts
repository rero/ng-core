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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Nl2brPipe } from '../pipe/nl2br.pipe';
import { DialogComponent } from './dialog.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let config: DynamicDialogConfig;
  let dialogRef: DynamicDialogRef;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ButtonModule,
        DynamicDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        DynamicDialogConfig,
        DynamicDialogRef
      ],
      declarations: [DialogComponent, Nl2brPipe],
    })
      .compileComponents();
    config = TestBed.inject(DynamicDialogConfig);
    config.data = {
      body: 'Would you like to quit?'
    }
    dialogRef = TestBed.inject(DynamicDialogRef);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should display the confirmation message', () => {
    const element = fixture.debugElement.nativeElement.querySelectorAll('div.flex')[1];
    expect(element.innerHTML).toContain(config.data.body);
  });

  it('Should return true on confirmation', () => {
    dialogRef.onClose.subscribe((flag: boolean) => expect(flag).toBeTrue());
    component.confirm();
  });

  it('Should return false on cancel', () => {
    dialogRef.onClose.subscribe((flag: boolean) => expect(flag).toBeFalse());
    component.cancel();
  });
});
