// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

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
