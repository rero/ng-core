// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { CallbackArrayFilterPipe } from './callback-array-filter.pipe';

describe('CallbackArrayFilterPipe', () => {
  const pipe = new CallbackArrayFilterPipe();

  it('Should return an empty array if there are no items', () => {
    expect(pipe.transform([])).toEqual([]);
  });

  it('Should return the original array if the callback function is not defined', () => {
    const items = [{ title: 'foo', value: 'foo' }];
    expect(pipe.transform(items)).toEqual(items);
  });

  it('Should return a filtered array', () => {
    const items = [
      { title: 'foo', value: 'foo' },
      { title: 'bar', value: 'bar' },
    ];
    const callback = (item: any) => item.value === 'bar';
    expect(pipe.transform(items, callback)).toEqual([{ title: 'bar', value: 'bar' }]);
  });
});
