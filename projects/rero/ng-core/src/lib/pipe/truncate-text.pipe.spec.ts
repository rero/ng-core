/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { TruncateTextPipe } from './truncate-text.pipe';

describe('TruncateTextPipe', () => {
    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pulvinar auctor lectus quis sodales.';

    const pipe = new TruncateTextPipe();

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
