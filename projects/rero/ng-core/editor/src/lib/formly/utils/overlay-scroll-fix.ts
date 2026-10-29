// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * True on iOS/iPadOS WebKit, including iPadOS which reports `navigator.platform`
 * as "MacIntel" for compatibility (on every Mac, Intel or Apple Silicon alike)
 * but, unlike a real Mac, exposes touch support.
 */
export function isIOSDevice(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
}

/**
 * Works around a touch-scroll bug affecting p-select/p-multiSelect/p-treeSelect
 * overlay panels on iOS Safari.
 *
 * When the overlay opens, WebKit appears to build its internal scroll tree
 * for the option list container using stale (pre-animation) dimensions -
 * likely because `p-motion` animates the overlay open from a near-zero
 * height. The result: the option list's `overflow: auto` never receives
 * touch-scroll gestures (its `scrollTop` never changes), and the gesture is
 * instead routed to the page, which visually drags the still-open overlay
 * along with it. This reproduces on iOS Simulator and on physical iPhones,
 * with or without `appendTo="body"`, and independently of any dismiss
 * listener or body-scroll-locking technique.
 *
 * Confirmed fix: detaching and reattaching the overlay element in the DOM
 * (`element.parentElement.appendChild(element)`) forces WebKit to rebuild
 * its scroll tree with the overlay's final dimensions, after which native
 * touch-scroll works correctly. This does not change the element's position
 * in the DOM tree, but re-parenting can drop focus from a focused descendant
 * (e.g. the filter input), so focus is restored afterwards.
 *
 * Must run after the `p-motion` open animation has settled - calling it
 * synchronously from the overlay's `(onShow)` event is too early and has no
 * effect (WebKit hasn't built its (defective) scroll tree yet), hence the
 * delay.
 *
 * Only applied on iOS: other platforms don't exhibit this bug, and the
 * re-parenting has a visible cost (reflow, transient focus loss) that isn't
 * worth paying elsewhere.
 */
export function fixOverlayTouchScroll(overlaySelector: string): void {
  if (!isIOSDevice()) {
    return;
  }
  setTimeout(() => {
    const overlay = document.querySelector(overlaySelector);
    if (!overlay?.parentElement) {
      return;
    }
    const { activeElement } = document;
    const hadFocus = overlay.contains(activeElement);
    overlay.parentElement.appendChild(overlay);
    if (hadFocus && activeElement instanceof HTMLElement) {
      activeElement.focus();
    }
  }, 100);
}
