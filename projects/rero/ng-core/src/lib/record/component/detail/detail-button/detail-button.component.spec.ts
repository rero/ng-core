// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonModule } from 'primeng/button';
import { DetailButtonComponent } from './detail-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { ComponentRef } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

describe('DetailButtonComponent', () => {
  let fixture: ComponentFixture<DetailButtonComponent>;
  let componentRef: ComponentRef<DetailButtonComponent>;

  const useAction = { can: true, message: 'Use enabled', url: '/foo' };
  const action = { can: true, message: '' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, ButtonModule, TooltipModule, TranslateModule.forRoot(), DetailButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailButtonComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('record', {
      created: '2025-01-01T00:00:00Z',
      updated: '2025-01-01T00:00:00Z',
      id: '1',
      links: { self: '/api/records/1' },
      metadata: { title: 'Foo' },
    });
    fixture.detectChanges();
  });

  it('should display only the default back button', () => {
    expect(fixture.debugElement.query(By.css('#detail-back-button'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-use-button'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-edit-button'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-delete-button'))).toBeNull();
  });

  it('should not show buttons without admin mode', () => {
    componentRef.setInput('useStatus', useAction);
    componentRef.setInput('deleteStatus', action);
    componentRef.setInput('updateStatus', action);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#detail-use-button'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-edit-button'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-delete-button'))).toBeNull();
  });

  it('should show buttons with admin mode enabled', () => {
    componentRef.setInput('adminMode', true);
    componentRef.setInput('useStatus', useAction);
    componentRef.setInput('deleteStatus', action);
    componentRef.setInput('updateStatus', action);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#detail-use-button'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-edit-button'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('#detail-delete-button'))).not.toBeNull();
  });
});
