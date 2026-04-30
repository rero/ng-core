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

import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { KatexDirective } from '../../directive/katex.directive';
import { Nl2brPipe } from '../../pipe/nl2br/nl2br.pipe';
import { ReadMoreComponent } from './read-more.component';

describe('ReadMoreComponent', () => {
  let component: ReadMoreComponent;
  let fixture: ComponentFixture<ReadMoreComponent>;

  const text =
    'We show that, given a metric space $$(\\mathrm{Y},\\textsf {d} )$$of curvature bounded from above in the sense of Alexandrov, and a positive Radon measure $$\\mu $$on $$\\mathrm{Y}$$giving finite mass to bounded sets, the resulting metric measure space $$(\\mathrm{Y},\\textsf {d} ,\\mu )$$is infinitesimally Hilbertian, i.e. the Sobolev space $$W^{1,2}(\\mathrm{Y},\\textsf {d} ,\\mu )$$is a Hilbert space. The result is obtained by constructing an isometric embedding of the ‘abstract and analytical’ space of derivations into the ‘concrete and geometrical’ bundle whose fibre at $$x\\in \\mathrm{Y}$$is the tangent cone at x of $$\\mathrm{Y}$$. The conclusion then follows from the fact that for every $$x\\in \\mathrm{Y}$$such a cone is a $$\\mathrm{CAT}(0)$$space and, as such, has a Hilbert-like structure.';

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ReadMoreComponent, Nl2brPipe, KatexDirective],
    }).overrideComponent(ReadMoreComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadMoreComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('text', text);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('math')).toBeFalsy();
  });

  it('should remove all html tags from the text', () => {
    fixture.componentRef.setInput('text', '<a href="#">link</a>');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').innerText).toEqual('link');
  });

  it('should contain 20 words + …', () => {
    fixture.componentRef.setInput('limit', 20);
    fixture.detectChanges();
    const segments = fixture.nativeElement.querySelector('span').innerText.split(/\s+/);
    expect(segments.pop()).toContain('…');
    expect(segments.length).toEqual(20);
  });

  it('should be a string of 20 characters + …', () => {
    fixture.componentRef.setInput('unit', 'char');
    fixture.componentRef.setInput('limit', 20);
    fixture.detectChanges();
    const data = fixture.nativeElement.querySelector('span').innerText;
    expect(data.slice(-1)).toContain('…');
    expect(data.slice(0, -1).length).toEqual(20);
  });

  it('should return the text unchanged', () => {
    fixture.componentRef.setInput('limit', 500);
    fixture.detectChanges();
    const data = fixture.nativeElement.querySelector('span').innerText;
    expect(data).toContain(text);
  });

  it('should change the character of trailing', () => {
    const trailing = '_';
    fixture.componentRef.setInput('trailing', trailing);
    fixture.detectChanges();
    const data = fixture.nativeElement.querySelector('span').innerText;
    expect(data.slice(-1)).toContain(trailing);
  });

  it('should change the title of the show more and show less link', () => {
    const moreLabel = 'test more';
    const lessLabel = 'test less';
    fixture.componentRef.setInput('showMoreLabel', moreLabel);
    fixture.componentRef.setInput('showLessLabel', lessLabel);
    fixture.detectChanges();
    let button = fixture.nativeElement.querySelector('p-button button');
    expect(button?.innerHTML).toContain(moreLabel);
    button?.click();
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('p-button button');
    expect(button?.innerHTML).toContain(lessLabel);
  });

  it('should change the text on the click show more', () => {
    fixture.componentRef.setInput('unit', 'char');
    fixture.componentRef.setInput('limit', 20);
    fixture.detectChanges();
    let data = fixture.nativeElement.querySelector('span').innerText;
    expect(data.slice(0, -1).length).toEqual(20);
    let button = fixture.nativeElement.querySelector('p-button button');
    expect(button?.innerHTML).toContain('show more');
    button?.click();
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('p-button button');
    expect(button?.innerHTML).toContain('show less');

    data = fixture.nativeElement.querySelector('span').innerText;
    expect(data.slice(0, -1).length > 20).toBe(true);
  });
});
