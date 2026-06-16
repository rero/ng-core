// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KatexDirective } from './katex.directive';

@Component({
  selector: 'ng-core-katex',
  imports: [KatexDirective],
  template: ` <div id="katex-data" katex>{{ katexData }}</div> `,
})
export class KatexComponent {
  katexData = 'Infinitesimal Hilbertianity of Locally $$\\mathrm{CAT}(\\kappa )$$-Spaces';
}

describe('KatexDirective', () => {
  let component: KatexComponent;
  let fixture: ComponentFixture<KatexComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [KatexComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KatexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should return a transformed string', () => {
    const div = fixture.nativeElement.querySelector('#katex-data');
    expect(div.querySelector('math')).toBeTruthy();
    const annotation = fixture.nativeElement.querySelector('#katex-data').querySelector('annotation');
    expect(annotation.innerHTML).toEqual('\\mathrm{CAT}(\\kappa )');
  });
});
