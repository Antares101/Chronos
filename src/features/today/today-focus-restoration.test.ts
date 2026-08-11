import { describe, expect, it, vi } from 'vitest';

import {
  closeTodayDisclosure,
  focusTodayRestorationTarget,
  persistTodayFocusTarget,
  persistTodayFocusTargetForSubmit,
  restoreTodayFocus,
} from './today-focus-restoration';

type FocusTarget = Pick<HTMLElement, 'focus' | 'querySelector'>;

function createFocusTarget(invalidDescendant: FocusTarget | null = null): FocusTarget {
  return {
    focus: vi.fn(),
    querySelector: vi.fn((selector: string) =>
      selector === '[aria-invalid="true"]' ? invalidDescendant : null,
    ),
  } as FocusTarget;
}

type StorageDouble = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

type RestorationDocument = Pick<Document, 'getElementById'>;

function createStorageDouble(overrides: Partial<StorageDouble> = {}): StorageDouble {
  return {
    getItem: vi.fn(() => null),
    removeItem: vi.fn(),
    setItem: vi.fn(),
    ...overrides,
  };
}

function createRestorationDocument(target: FocusTarget | null): RestorationDocument {
  return { getElementById: vi.fn(() => target as HTMLElement | null) };
}

describe('Today focus restoration', () => {
  it.each(['Daily Header', 'Closeout'])(
    'focuses the first invalid textarea descendant instead of the %s wrapper',
    () => {
      const invalidTextarea = createFocusTarget();
      const section = createFocusTarget(invalidTextarea);

      focusTodayRestorationTarget(section as HTMLElement);

      expect(section.querySelector).toHaveBeenCalledWith('[aria-invalid="true"]');
      expect(invalidTextarea.focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(section.focus).not.toHaveBeenCalled();
    },
  );

  it('focuses an invalid Quick Capture input descendant instead of its wrapper', () => {
    const invalidInput = createFocusTarget();
    const section = createFocusTarget(invalidInput);

    focusTodayRestorationTarget(section as HTMLElement);

    expect(invalidInput.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(section.focus).not.toHaveBeenCalled();
  });

  it('falls back to the section wrapper when no invalid descendant exists', () => {
    const section = createFocusTarget();

    focusTodayRestorationTarget(section as HTMLElement);

    expect(section.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('closes a native disclosure and returns focus to its summary', () => {
    const summary = { focus: vi.fn() };
    const details = { open: true, querySelector: () => summary };

    closeTodayDisclosure(details as never);

    expect(details.open).toBe(false);
    expect(summary.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('persists the focus target for a non-canceled submit', () => {
    const storage = createStorageDouble();

    persistTodayFocusTargetForSubmit(
      { defaultPrevented: false } as SubmitEvent,
      storage,
      'chronos:today:return-focus',
      'today-capture',
    );

    expect(storage.setItem).toHaveBeenCalledWith('chronos:today:return-focus', 'today-capture');
  });

  it('does not persist a focus target for a canceled submit', () => {
    const storage = createStorageDouble();

    persistTodayFocusTargetForSubmit(
      { defaultPrevented: true } as SubmitEvent,
      storage,
      'chronos:today:return-focus',
      'today-capture',
    );

    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('does not throw when submit persistence setItem throws', () => {
    const storage = createStorageDouble({
      setItem: vi.fn(() => {
        throw new DOMException('Storage is unavailable', 'SecurityError');
      }),
    });

    expect(() =>
      persistTodayFocusTarget(storage, 'chronos:today:return-focus', 'today-capture'),
    ).not.toThrow();
  });

  it('no-ops safely when restoration getItem throws', () => {
    const storage = createStorageDouble({
      getItem: vi.fn(() => {
        throw new DOMException('Storage is unavailable', 'SecurityError');
      }),
    });
    const target = createFocusTarget();
    const document = createRestorationDocument(target);

    expect(() => restoreTodayFocus(storage, 'chronos:today:return-focus', document)).not.toThrow();
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(document.getElementById).not.toHaveBeenCalled();
    expect(target.focus).not.toHaveBeenCalled();
  });

  it('restores focus after successfully consuming the stored key', () => {
    const invalidControl = createFocusTarget();
    const target = createFocusTarget(invalidControl);
    const storage = createStorageDouble({ getItem: vi.fn(() => 'today-capture') });
    const document = createRestorationDocument(target);

    restoreTodayFocus(storage, 'chronos:today:return-focus', document);

    expect(storage.removeItem).toHaveBeenCalledWith('chronos:today:return-focus');
    expect(document.getElementById).toHaveBeenCalledWith('today-capture');
    expect(invalidControl.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('does not restore focus when removeItem throws and the key may remain uncleared', () => {
    const invalidControl = createFocusTarget();
    const target = createFocusTarget(invalidControl);
    const storage = createStorageDouble({
      getItem: vi.fn(() => 'today-capture'),
      removeItem: vi.fn(() => {
        throw new DOMException('Storage is full', 'QuotaExceededError');
      }),
    });
    const document = createRestorationDocument(target);

    expect(() => restoreTodayFocus(storage, 'chronos:today:return-focus', document)).not.toThrow();
    expect(storage.removeItem).toHaveBeenCalledWith('chronos:today:return-focus');
    expect(document.getElementById).not.toHaveBeenCalled();
    expect(invalidControl.focus).not.toHaveBeenCalled();
  });
});
