import { describe, expect, it, vi } from 'vitest';

import { bindTodayCloseReviewDismissal } from './today-close-review';

type Listener = (event: {
  key?: string;
  preventDefault: ReturnType<typeof vi.fn>;
  target: unknown;
}) => void;

function createRoot() {
  const listeners = new Map<string, Listener>();
  return {
    addEventListener: vi.fn((type: string, listener: Listener) => listeners.set(type, listener)),
    removeEventListener: vi.fn((type: string) => listeners.delete(type)),
    dispatch(type: string, target: unknown, key?: string) {
      const preventDefault = vi.fn();
      listeners.get(type)?.({ target, key, preventDefault });
      return preventDefault;
    },
  };
}

function createReview(open = true) {
  const summary = { focus: vi.fn() };
  return {
    open,
    querySelector: vi.fn(() => summary),
    summary,
  };
}

describe('Today close-review dismissal', () => {
  it('dismisses the inline review client-side and returns focus to its summary', () => {
    const root = createRoot();
    const review = createReview();
    const dismissButton = {
      closest: vi.fn((selector: string) =>
        selector === '[data-today-close-review-dismiss]'
          ? dismissButton
          : selector === '[data-today-close-review]'
            ? review
            : null,
      ),
    };

    bindTodayCloseReviewDismissal(root as never);
    const preventDefault = root.dispatch('click', dismissButton);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(review.open).toBe(false);
    expect(review.summary.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('dismisses an open inline review with Escape without changing a direct conclusion form', () => {
    const root = createRoot();
    const review = createReview();
    const target = {
      closest: vi.fn((selector: string) =>
        selector === '[data-today-close-review]' ? review : null,
      ),
    };

    bindTodayCloseReviewDismissal(root as never);
    const preventDefault = root.dispatch('keydown', target, 'Escape');

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(review.open).toBe(false);
    expect(review.summary.focus).toHaveBeenCalledWith({ preventScroll: true });
  });
});
