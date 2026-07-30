// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { isIOSDevice } from './overlay-scroll-fix';

describe('isIOSDevice', () => {
  const stubNavigator = (overrides: Partial<Navigator>): void => {
    vi.stubGlobal('navigator', { ...navigator, ...overrides });
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return false on a desktop Mac (no touch support)', () => {
    stubNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      platform: 'MacIntel',
      maxTouchPoints: 0,
    });
    expect(isIOSDevice()).toBe(false);
  });

  it('should return true on an iPhone', () => {
    stubNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    expect(isIOSDevice()).toBe(true);
  });

  it('should return true on an iPad reporting itself as MacIntel with touch support', () => {
    stubNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    });
    expect(isIOSDevice()).toBe(true);
  });

  it('should return false on a non-Apple platform', () => {
    stubNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    expect(isIOSDevice()).toBe(false);
  });
});
