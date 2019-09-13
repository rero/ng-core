import { UpperCaseFirstPipe } from './ucfirst.pipe';

describe('UpperCaseFirstPipe', () => {
    const pipe = new UpperCaseFirstPipe();

    it('uppercase the first char of word', () => {
        expect(pipe.transform('the title')).toBe('The title');
    });

    it('return null because entry value is null', () => {
        expect(pipe.transform(null)).toBe(null);
    });
});
