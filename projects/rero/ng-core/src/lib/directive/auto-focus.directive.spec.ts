import { AutoFocusDirective } from './auto-focus.directive';

describe('AutoFocusDirective', () => {
  it('should create an instance', () => {
    const elRefMock = {
      nativeElement: document.createElement('input')
    };
    const directive = new AutoFocusDirective(elRefMock);
    expect(directive).toBeTruthy();
  });
});
