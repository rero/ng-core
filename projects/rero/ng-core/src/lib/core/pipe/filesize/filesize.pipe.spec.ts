// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { FilesizePipe } from './filesize.pipe';

describe('FilesizePipe', () => {
  const pipe = new FilesizePipe();

  it('Should return the value according to the unit', () => {
    const sizes: Record<string, string> = {
      1000: '0.98 kB',
      1500000: '1.43 MB',
      1500000000: '1.40 GB',
      1500000000000: '1.36 TB',
      1500000000000000: '1.33 PB',
      1500000000000000000: '1.30 EB',
      1500000000000000000000: '1.27 ZB',
      1500000000000000000000000: '1.24 YB',
    };

    Object.keys(sizes).forEach((key) => {
      expect(pipe.transform(Number(key))).toEqual(sizes[key]);
    });
  });

  it('Should return the value with the precision', () => {
    expect(pipe.transform(1500000, 4)).toEqual('1.4305 MB');
  });
});
