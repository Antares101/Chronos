import { describe, expect, it, vi } from 'vitest';

import {
  isTodayBlockActionDraft,
  restoreTodayBlockActionDraft,
} from './today-block-action-recovery';

type FormControl = { value: string; checked?: boolean };

function createForm(controls: Record<string, FormControl[]>, action: string) {
  const details = { open: false };
  const form = {
    closest: vi.fn(() => details),
    dataset: { todayBlockId: 'block-1', todayBlockAction: action },
    querySelectorAll: vi.fn((selector: string) => controls[selector] ?? []),
  } as unknown as HTMLFormElement;

  return { details, form };
}

function createDocument(form: HTMLFormElement | null) {
  return {
    querySelectorAll: vi.fn(() => (form ? [form] : [])),
  } as unknown as Pick<Document, 'querySelectorAll'>;
}

describe('restoreTodayBlockActionDraft', () => {
  it.each([
    ['create-highlighted-event', 'Resolved blocker'],
    ['create-task', 'Follow up'],
  ] as const)('restores the %s title only in its matching form', (action, title) => {
    const matchingTitle = { value: '' };
    const { details, form } = createForm({ '[name="title"]': [matchingTitle] }, action);

    restoreTodayBlockActionDraft({ action, blockId: 'block-1', title }, createDocument(form));

    expect(matchingTitle.value).toBe(title);
    expect(details.open).toBe(true);
  });

  it.each([
    { action: 'log-pause', blockId: 'block-1', pauseKind: 'untimed', note: 'Take a walk' },
    {
      action: 'conclude-block',
      blockId: 'block-1',
      completedTaskIds: ['task-1'],
      notes: 'Wrapped up',
      nextAdjustment: 'Start earlier',
    },
  ])('rejects unsafe $action drafts so they cannot trigger restoration', (draft) => {
    const restore = vi.fn();

    if (isTodayBlockActionDraft(draft)) restore(draft);

    expect(isTodayBlockActionDraft(draft)).toBe(false);
    expect(restore).not.toHaveBeenCalled();
  });

  it('does not change any form when no matching block-action form exists', () => {
    const document = createDocument(null);

    restoreTodayBlockActionDraft(
      { action: 'create-task', blockId: 'block-1', title: 'Follow up' },
      document,
    );

    expect(document.querySelectorAll).toHaveBeenCalledTimes(1);
  });
});
