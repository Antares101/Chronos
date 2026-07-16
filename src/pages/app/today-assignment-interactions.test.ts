import { describe, expect, it, vi } from 'vitest';

import { bindTodayAssignmentInteractions } from './today-assignment-interactions';

type Listener = (event: Record<string, unknown>) => void;

type FakeNode = ReturnType<typeof createNode>;

function createNode(dataset: Record<string, string> = {}) {
  const listeners = new Map<string, Listener[]>();
  const attributes = new Map<string, string>();
  return {
    dataset,
    textContent: '',
    value: '',
    draggable: false,
    requestSubmit: vi.fn(),
    addEventListener(type: string, listener: Listener) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
    removeEventListener(type: string, listener: Listener) {
      listeners.set(
        type,
        (listeners.get(type) ?? []).filter((item) => item !== listener),
      );
    },
    dispatch(type: string, event: Record<string, unknown> = {}) {
      for (const listener of listeners.get(type) ?? [])
        listener({ preventDefault: vi.fn(), ...event });
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
    removeAttribute(name: string) {
      attributes.delete(name);
    },
  };
}

function createFixture({ coarse = false, stale = false } = {}) {
  const task = createNode({ assignmentTask: 'task-1' });
  const target = createNode({ assignmentTarget: 'block-1', assignmentTargetLabel: 'Focus block' });
  const select = createNode();
  const status = createNode();
  status.value = 'todo';
  const form = createNode({ assignmentTaskId: 'task-1' });
  const feedback = createNode();
  const option = createNode();
  option.value = stale ? 'other-block' : 'block-1';
  const root = createNode() as FakeNode & {
    documentElement: FakeNode;
    defaultView: { matchMedia: () => { matches: boolean } };
    querySelector: (selector: string) => FakeNode | null;
    querySelectorAll: (selector: string) => FakeNode[];
  };
  root.documentElement = createNode();
  root.defaultView = { matchMedia: () => ({ matches: coarse }) };
  root.querySelector = (selector) =>
    selector === '[data-today-inbox-drag-feedback]' ? feedback : null;
  root.querySelectorAll = (selector) => {
    if (selector === '[data-assignment-task]') return [task];
    if (selector === '[data-assignment-target]') return [target];
    if (selector === '[data-today-inbox-assignment]') return [form];
    if (selector === 'select[name="blockId"]') return [select];
    if (selector === 'option') return [option];
    if (selector === 'input[name="status"]') return [status];
    return [];
  };
  (form as FakeNode & { querySelectorAll: typeof root.querySelectorAll }).querySelectorAll =
    root.querySelectorAll;
  (form as FakeNode & { querySelector: typeof root.querySelector }).querySelector = (selector) =>
    selector === 'select[name="blockId"]' ? select : null;
  return { feedback, form, root, select, status, target, task };
}

describe('today assignment interactions', () => {
  it('submits the existing form for a valid authoritative target without touching task status', () => {
    const { feedback, form, root, select, status, target, task } = createFixture();

    bindTodayAssignmentInteractions(root as never);
    task.dispatch('dragstart');
    target.dispatch('dragover');
    target.dispatch('drop');

    expect(select.value).toBe('block-1');
    expect(status.value).toBe('todo');
    expect(form.requestSubmit).toHaveBeenCalledTimes(1);
    expect(form.getAttribute('data-assignment-state')).toBe('submitting');
    expect(form.getAttribute('aria-busy')).toBe('true');
    expect(feedback.textContent).toBe('Assigning to Focus block.');
  });

  it('rejects stale targets and clears temporary drag state on drag end and Escape', () => {
    const { form, root, target, task } = createFixture({ stale: true });

    bindTodayAssignmentInteractions(root as never);
    task.dispatch('dragstart');
    target.dispatch('dragover');
    target.dispatch('drop');

    expect(target.getAttribute('data-assignment-state')).toBe('rejected');
    expect(form.requestSubmit).not.toHaveBeenCalled();
    task.dispatch('dragend');
    expect(target.getAttribute('data-assignment-state')).toBeNull();
    expect(root.documentElement.getAttribute('data-assignment-dragging')).toBeNull();

    task.dispatch('dragstart');
    root.dispatch('keydown', { key: 'Escape' });
    expect(root.documentElement.getAttribute('data-assignment-dragging')).toBeNull();
  });

  it('closes only an open native assignment disclosure on Escape and returns focus to its summary without submitting or changing data', () => {
    const { form, root, select, status } = createFixture();
    const details = Object.assign(createNode(), {
      open: true,
      querySelector: vi.fn(),
    }) as FakeNode & {
      open: boolean;
      querySelector: any;
    };
    const summary = Object.assign(createNode(), {
      closest: vi.fn(),
      focus: vi.fn(),
    }) as FakeNode & {
      closest: any;
      focus: any;
    };
    summary.closest.mockImplementation((selector: string) =>
      selector === 'details[open]' ? details : null,
    );
    details.querySelector.mockImplementation((selector: string) => {
      if (selector === '[data-today-inbox-assignment]') return form;
      if (selector === 'summary') return summary;
      return null;
    });

    bindTodayAssignmentInteractions(root as never);
    root.dispatch('keydown', { key: 'Escape', target: summary });

    expect(details.open).toBe(false);
    expect(summary.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(form.requestSubmit).not.toHaveBeenCalled();
    expect(select.value).toBe('');
    expect(status.value).toBe('todo');
  });

  it('prevents duplicate submissions, tears down listeners, and leaves coarse pointers on native forms', () => {
    const fixture = createFixture();
    const binding = bindTodayAssignmentInteractions(fixture.root as never);
    const duplicate = bindTodayAssignmentInteractions(fixture.root as never);

    fixture.task.dispatch('dragstart');
    fixture.target.dispatch('drop');
    fixture.task.dispatch('dragstart');
    fixture.target.dispatch('drop');
    expect(fixture.form.requestSubmit).toHaveBeenCalledTimes(1);
    expect(duplicate).toBe(binding);

    binding?.destroy();
    fixture.task.dispatch('dragstart');
    fixture.target.dispatch('drop');
    expect(fixture.form.requestSubmit).toHaveBeenCalledTimes(1);

    const touchFixture = createFixture({ coarse: true });
    expect(bindTodayAssignmentInteractions(touchFixture.root as never)).toBeNull();
    expect(touchFixture.task.draggable).toBe(false);
  });
});
