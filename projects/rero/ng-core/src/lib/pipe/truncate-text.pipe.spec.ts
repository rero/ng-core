import { TruncateTextPipe } from './truncate-text.pipe';

describe('TruncateTextPipe', () => {
    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pulvinar auctor lectus quis sodales.';

    let pipe = new TruncateTextPipe();

    it('Short text not truncated', () => {
        expect(pipe.transform('Short text')).toBe('Short text');
    });

    it('Long text truncated to 3 words', () => {
        expect(pipe.transform(longText, 3)).toBe('Lorem ipsum dolor…');
    });

    it('null entry value', () => {
        expect(pipe.transform(null)).toEqual('');
    });

    it('Negative limit', () => {
        expect(pipe.transform(longText, -3)).toBe('…lectus quis sodales.');
    });

    it('Custom trailing char', () => {
        expect(pipe.transform(longText, 3, '!')).toBe('Lorem ipsum dolor!');
    });
});