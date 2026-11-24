// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

/** Space kept between the bottom of the suggestion panel and the visible area. */
export const SUGGESTIONS_BOTTOM_MARGIN = 16;

/** Below this height, the input is scrolled to the top to make room for the panel. */
export const SUGGESTIONS_MIN_HEIGHT = 160;

/**
 * Compute the height left below an element in the visible area.
 *
 * On mobile, the virtual keyboard shrinks the visual viewport but not the
 * layout viewport: the visual viewport gives the area the user really sees.
 *
 * @param elementBottom - bottom of the element, relative to the layout viewport
 * @param viewportBottom - bottom of the visible area, relative to the layout viewport
 * @returns the available height in pixels, never negative
 */
export function availableHeightBelow(elementBottom: number, viewportBottom: number): number {
  return Math.max(0, Math.floor(viewportBottom - elementBottom - SUGGESTIONS_BOTTOM_MARGIN));
}

/**
 * Cap the configured scroll height of the suggestion panel to the available height.
 *
 * The panel then fits below the input, so the overlay never flips over it,
 * even when little room is left.
 *
 * @param scrollHeight - configured CSS height (e.g. `400px`, `50vh`)
 * @param availableHeight - available height in pixels, undefined if unknown
 * @returns a CSS height
 */
export function capScrollHeight(scrollHeight: string, availableHeight: number | undefined): string {
  if (availableHeight === undefined) {
    return scrollHeight;
  }
  return `min(${scrollHeight}, ${availableHeight}px)`;
}

/**
 * Bottom of the area the user really sees, relative to the layout viewport.
 *
 * @param window - the browser window
 * @returns the bottom of the visual viewport, or of the window without this API
 */
export function visibleBottom(window: Window): number {
  const { visualViewport, innerHeight } = window;
  return visualViewport ? visualViewport.offsetTop + visualViewport.height : innerHeight;
}
