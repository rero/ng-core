// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  availableHeightBelow,
  capScrollHeight,
  SUGGESTIONS_BOTTOM_MARGIN,
  SUGGESTIONS_MIN_HEIGHT,
  visibleBottom,
} from './search-autocomplete.utils';

describe('availableHeightBelow', () => {
  it('should return the space below the element minus the margin', () => {
    expect(availableHeightBelow(100, 400)).toBe(300 - SUGGESTIONS_BOTTOM_MARGIN);
  });

  it('should round down fractional values', () => {
    expect(availableHeightBelow(100.4, 400.9)).toBe(300 - SUGGESTIONS_BOTTOM_MARGIN);
  });

  it('should never be negative', () => {
    expect(availableHeightBelow(500, 400)).toBe(0);
  });
});

describe('capScrollHeight', () => {
  it('should keep the configured height when the available height is unknown', () => {
    expect(capScrollHeight('400px', undefined)).toBe('400px');
  });

  it('should cap the configured height to the available height', () => {
    expect(capScrollHeight('400px', 250)).toBe('min(400px, 250px)');
  });

  it('should not go below the minimum height', () => {
    expect(capScrollHeight('50vh', 20)).toBe(`min(50vh, ${SUGGESTIONS_MIN_HEIGHT}px)`);
  });
});

describe('visibleBottom', () => {
  it('should use the visual viewport when available', () => {
    const window = { innerHeight: 800, visualViewport: { offsetTop: 120, height: 350 } } as unknown as Window;
    expect(visibleBottom(window)).toBe(470);
  });

  it('should fall back to the window height', () => {
    const window = { innerHeight: 800, visualViewport: null } as unknown as Window;
    expect(visibleBottom(window)).toBe(800);
  });
});
