import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import TodayShortcutReference from '../../components/today/TodayShortcutReference';
import { bindTodayShortcuts } from './today-shortcuts';

type Listener = (event: KeyboardEvent | Event) => void;

type FakeElement = ReturnType<typeof createElementFixture>;

function createElementFixture(tagName = 'DIV'): any {
  const listeners = new Map<string, Listener[]>();
  return {
    tagName,
    isContentEditable: false,
    open: false,
    focus: vi.fn(),
    showModal: vi.fn(function (this: { open: boolean }) {
      this.open = true;
    }),
    close: vi.fn(function (this: { open: boolean }) {
      this.open = false;
    }),
    addEventListener(type: string, listener: Listener) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
    removeEventListener(type: string, listener: Listener) {
      listeners.set(
        type,
        (listeners.get(type) ?? []).filter((item) => item !== listener),
      );
    },
    dispatch(type: string, event: Partial<KeyboardEvent> = {}) {
      const preventDefault = vi.fn();
      for (const listener of listeners.get(type) ?? [])
        listener({ preventDefault, currentTarget: this, target: this, ...event } as KeyboardEvent);
      return preventDefault;
    },
    closest: vi.fn(() => null),
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
  };
}

function createFixture({ inbox = true, closeEligible = true } = {}) {
  const trigger = createElementFixture('BUTTON');
  const dialog = createElementFixture('DIALOG');
  const closeButton = createElementFixture('BUTTON');
  const active = createElementFixture();
  const inboxTarget = createElementFixture('SUMMARY');
  const inboxHeading = createElementFixture('H2');
  const quickTask = createElementFixture('INPUT');
  const quickBlock = createElementFixture('INPUT');
  const closeSummary = createElementFixture('SUMMARY');
  const closeReview = createElementFixture('DETAILS');
  closeReview.querySelector.mockReturnValue(closeSummary);
  dialog.querySelector.mockReturnValue(closeButton);
  dialog.querySelectorAll.mockReturnValue([closeButton]);
  const root = createElementFixture() as FakeElement & {
    querySelector: ReturnType<typeof vi.fn>;
  };
  root.querySelector.mockImplementation((selector: string) => {
    const nodes: Record<string, FakeElement | null> = {
      '[data-today-shortcuts-trigger]': trigger,
      '[data-today-shortcuts-dialog]': dialog,
      '[data-today-shortcuts-close]': closeButton,
      '#today-active-block': active,
      '#today-open-tasks summary': inbox ? inboxTarget : null,
      '#today-task-inbox-title': inboxHeading,
      '#today-quick-task-title': quickTask,
      '#today-quick-block-title': quickBlock,
      '[data-today-close-review]': closeEligible ? closeReview : null,
    };
    return nodes[selector] ?? null;
  });
  return {
    active,
    closeButton,
    closeReview,
    closeSummary,
    dialog,
    inboxHeading,
    inboxTarget,
    quickBlock,
    quickTask,
    root,
    trigger,
  };
}

function keyEvent(key: string, target: FakeElement, overrides: Record<string, unknown> = {}) {
  return { key, target, ...overrides } as Partial<KeyboardEvent>;
}

describe('TodayShortcutReference', () => {
  it('renders a visible accessible trigger and native dialog with the route-local key reference', () => {
    const markup = renderToStaticMarkup(createElement(TodayShortcutReference));

    expect(markup).toContain('data-today-shortcuts-trigger="true"');
    expect(markup).toContain('aria-label="Keyboard shortcuts"');
    expect(markup).toContain(
      '<dialog data-today-shortcuts-dialog="true" aria-labelledby="today-shortcuts-title">',
    );
    expect(markup).toContain('data-today-shortcuts-close="true"');
    for (const key of ['?', 'a', 'i', 'q', 'b', 'c', 'Escape'])
      expect(markup).toContain(`<kbd>${key}</kbd>`);
    expect(markup).toContain('@media(prefers-reduced-motion:reduce)');
    expect(markup).toContain('@media(prefers-reduced-transparency:reduce)');
    expect(markup).toContain('box-sizing:border-box');
    expect(markup).toContain('inline-size:min(calc(100dvi - 2rem),34rem)');
    expect(markup).toContain('max-inline-size:calc(100dvi - 2rem)');
    expect(markup).not.toContain(
      '--today-shortcuts-surface:var(--background,#fff);--today-shortcuts-foreground:var(--foreground,#0f172a)',
    );
    expect(markup).toContain(
      '--today-shortcuts-surface:hsl(var(--background));--today-shortcuts-foreground:hsl(var(--foreground))',
    );
  });
});

describe('today route shortcuts', () => {
  it('opens with ? or the visible button, focuses the close control, and restores the invoking focus on Escape/button close', () => {
    const fixture = createFixture();
    bindTodayShortcuts(fixture.root as never);

    fixture.root.dispatch('keydown', keyEvent('?', fixture.root));
    expect(fixture.dialog.showModal).toHaveBeenCalledOnce();
    expect(fixture.closeButton.focus).toHaveBeenCalledWith({ preventScroll: true });

    fixture.root.dispatch('keydown', keyEvent('Escape', fixture.closeButton));
    expect(fixture.dialog.close).toHaveBeenCalledOnce();
    expect(fixture.root.focus).toHaveBeenCalledWith({ preventScroll: true });

    fixture.trigger.dispatch('click');
    fixture.closeButton.dispatch('click');
    expect(fixture.trigger.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('wraps Tab and Shift+Tab inside the open dialog without invoking a cockpit shortcut', () => {
    const fixture = createFixture();
    bindTodayShortcuts(fixture.root as never);

    fixture.trigger.dispatch('click');
    fixture.closeButton.focus.mockClear();
    const tab = fixture.root.dispatch('keydown', keyEvent('Tab', fixture.closeButton));
    const reverseTab = fixture.root.dispatch(
      'keydown',
      keyEvent('Tab', fixture.closeButton, { shiftKey: true }),
    );

    expect(tab).toHaveBeenCalledOnce();
    expect(reverseTab).toHaveBeenCalledOnce();
    expect(fixture.closeButton.focus).toHaveBeenNthCalledWith(1, { preventScroll: true });
    expect(fixture.closeButton.focus).toHaveBeenNthCalledWith(2, { preventScroll: true });
    expect(fixture.active.focus).not.toHaveBeenCalled();
  });

  it('focuses active, inbox, capture, quick-block, and eligible close destinations without mutating data', () => {
    const fixture = createFixture();
    bindTodayShortcuts(fixture.root as never);

    for (const [key, node] of Object.entries({
      a: fixture.active,
      i: fixture.inboxTarget,
      q: fixture.quickTask,
      b: fixture.quickBlock,
      c: fixture.closeSummary,
    })) {
      fixture.root.dispatch('keydown', keyEvent(key, fixture.root));
      expect(node.focus).toHaveBeenCalledWith({ preventScroll: true });
    }
    expect(fixture.closeReview.open).toBe(true);

    const emptyInbox = createFixture({ inbox: false, closeEligible: false });
    bindTodayShortcuts(emptyInbox.root as never);
    emptyInbox.root.dispatch('keydown', keyEvent('i', emptyInbox.root));
    emptyInbox.root.dispatch('keydown', keyEvent('c', emptyInbox.root));
    expect(emptyInbox.inboxHeading.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(emptyInbox.closeSummary.focus).not.toHaveBeenCalled();
  });

  it('leaves native and editable controls, open dialogs, and modified/repeated/default-prevented keys alone', () => {
    const fixture = createFixture();
    bindTodayShortcuts(fixture.root as never);
    const editable = createElementFixture('INPUT');
    const link = createElementFixture('A');
    const dialogChild = createElementFixture();
    dialogChild.closest.mockImplementation((selector: string) =>
      selector.includes('dialog[open]') ? fixture.dialog : null,
    );

    fixture.root.dispatch('keydown', keyEvent('?', editable));
    expect(fixture.dialog.showModal).not.toHaveBeenCalled();
    fixture.root.dispatch('keydown', keyEvent('?', link));
    expect(fixture.dialog.showModal).not.toHaveBeenCalled();
    fixture.root.dispatch('keydown', keyEvent('?', dialogChild));
    expect(fixture.dialog.showModal).not.toHaveBeenCalled();
    fixture.root.dispatch('keydown', keyEvent('?', fixture.root, { ctrlKey: true }));
    expect(fixture.dialog.showModal).not.toHaveBeenCalled();
    fixture.root.dispatch('keydown', keyEvent('?', fixture.root, { repeat: true }));
    expect(fixture.dialog.showModal).not.toHaveBeenCalled();
    fixture.root.dispatch('keydown', keyEvent('?', fixture.root, { defaultPrevented: true }));
    expect(fixture.dialog.showModal).not.toHaveBeenCalled();
  });
});
