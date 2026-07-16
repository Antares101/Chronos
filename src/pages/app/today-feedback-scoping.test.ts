import { describe, expect, it } from 'vitest';

import { resolveTodayLocalFeedback } from './today-feedback-scoping';

describe('resolveTodayLocalFeedback', () => {
  it('scopes an action error to the submitted draft action', () => {
    expect(
      resolveTodayLocalFeedback(
        { action: 'today-save-goals' },
        'Choose no more than three goals.',
        null,
      ),
    ).toEqual({
      actionError: { action: 'today-save-goals', message: 'Choose no more than three goals.' },
    });
  });

  it.each([
    ['Daily header saved.', 'today-save-daily-header'],
    ['Goals saved.', 'today-save-goals'],
    ['Closeout saved.', 'today-save-closeout'],
    ['Task added.', 'today-create-task'],
    ['Task added to Focus block.', 'today-create-task'],
  ] as const)('scopes %s success without requiring an action draft', (message, action) => {
    expect(resolveTodayLocalFeedback(undefined, null, message)).toEqual({
      statusMessage: { action, message },
    });
  });

  it('scopes status by its message rather than a mismatched action draft', () => {
    expect(
      resolveTodayLocalFeedback({ action: 'today-save-goals' }, null, 'Daily header saved.'),
    ).toEqual({
      statusMessage: { action: 'today-save-daily-header', message: 'Daily header saved.' },
    });
  });

  it('scopes a Day Sheet task confirmation locally by its allowlisted feedback origin', () => {
    expect(
      resolveTodayLocalFeedback(undefined, null, 'Task added to Focus block.', 'today-day-sheet'),
    ).toEqual({
      statusMessage: { action: 'create-task', message: 'Task added to Focus block.' },
    });
  });

  it('keeps task confirmations scoped to Quick Capture for missing or untrusted origins', () => {
    for (const feedbackOrigin of [undefined, 'forged-origin']) {
      expect(resolveTodayLocalFeedback(undefined, null, 'Task added.', feedbackOrigin)).toEqual({
        statusMessage: { action: 'today-create-task', message: 'Task added.' },
      });
    }
  });

  it('scopes an inbox assignment confirmation only for its allowlisted feedback origin', () => {
    expect(resolveTodayLocalFeedback(undefined, null, 'Task moved.', 'today-inbox')).toEqual({
      statusMessage: { action: 'assign-task', message: 'Task moved.' },
    });
    expect(resolveTodayLocalFeedback(undefined, null, 'Task moved.')).toEqual({});
  });

  it('scopes an inbox assignment error to the assignment form', () => {
    expect(
      resolveTodayLocalFeedback(
        { action: 'assign-task' },
        'That change could not be saved. Check the form and try again.',
        null,
        'today-inbox',
      ),
    ).toEqual({
      actionError: {
        action: 'assign-task',
        message: 'That change could not be saved. Check the form and try again.',
      },
    });
  });

  it('scopes reviewed and direct conclusion feedback only to the close-review surface', () => {
    expect(
      resolveTodayLocalFeedback(undefined, null, 'Review saved.', 'today-close-review'),
    ).toEqual({
      statusMessage: { action: 'conclude-block', message: 'Review saved.' },
    });
    expect(
      resolveTodayLocalFeedback(undefined, null, 'Block concluded.', 'today-close-review'),
    ).toEqual({
      statusMessage: { action: 'conclude-block-without-review', message: 'Block concluded.' },
    });
    expect(
      resolveTodayLocalFeedback(
        undefined,
        'That change could not be saved. Check the form and try again.',
        null,
        'today-close-review',
      ),
    ).toEqual({
      actionError: {
        action: 'conclude-block',
        message: 'That change could not be saved. Check the form and try again.',
      },
    });
  });

  it('keeps unknown statuses shell-visible even when an action draft exists', () => {
    expect(
      resolveTodayLocalFeedback({ action: 'today-create-task' }, null, 'Workspace refreshed.'),
    ).toEqual({});
  });
});
