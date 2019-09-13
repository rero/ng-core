import { DefaultPipe } from './default.pipe';

describe('DefaultPipe', () => {
    const pipe = new DefaultPipe();

    it('return current value because it is not null', () => {
        expect(pipe.transform('Current value', 'New value')).toBe('Current value');
    });

    it('return default value because current value is empty or null', () => {
        expect(pipe.transform('', 'Default value')).toBe('Default value');
        expect(pipe.transform(null, 'Default value')).toBe('Default value');
    });
});
