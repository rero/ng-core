/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
