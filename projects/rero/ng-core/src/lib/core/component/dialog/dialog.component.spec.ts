// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Nl2brPipe } from '../../pipe/nl2br/nl2br.pipe';
import { DialogComponent } from './dialog.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let config: DynamicDialogConfig;
  let dialogRef: DynamicDialogRef;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule, ButtonModule, DynamicDialogModule, TranslateModule.forRoot(), DialogComponent, Nl2brPipe],
      providers: [DynamicDialogConfig, DynamicDialogRef],
    });
    config = TestBed.inject(DynamicDialogConfig);
    config.data = {
      body: 'Would you like to quit?',
    };
    dialogRef = TestBed.inject(DynamicDialogRef);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should display the confirmation message', () => {
    const element = fixture.debugElement.nativeElement.querySelectorAll('div > div')[1];
    expect(element.innerHTML).toContain(config.data.body);
  });

  it('Should return true on confirmation', () => {
    dialogRef.onClose.subscribe((flag: boolean) => expect(flag).toBe(true));
    component.confirm();
  });

  it('Should return false on cancel', () => {
    dialogRef.onClose.subscribe((flag: boolean) => expect(flag).toBe(false));
    component.cancel();
  });
});
