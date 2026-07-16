import type { TodayActionDraft } from '../../server/app/route-contract';

type TodayFeedbackAction =
  TodayActionDraft['action'] | 'create-task' | 'conclude-block' | 'conclude-block-without-review';

type TodayFeedbackMessage = {
  action: TodayFeedbackAction;
  message: string;
};

export type TodayLocalFeedback = {
  actionError?: TodayFeedbackMessage;
  statusMessage?: TodayFeedbackMessage;
};

function resolveTodaySuccessAction(
  message: string,
  feedbackOrigin: string | null | undefined,
): TodayFeedbackAction | undefined {
  if (message === 'Daily header saved.') return 'today-save-daily-header';
  if (message === 'Goals saved.') return 'today-save-goals';
  if (message === 'Closeout saved.') return 'today-save-closeout';
  if (message === 'Block added.' && feedbackOrigin === 'today-quick-block') {
    return 'create-planned-block';
  }
  if (message === 'Task moved.' && feedbackOrigin === 'today-inbox') return 'assign-task';
  if (message === 'Review saved.' && feedbackOrigin === 'today-close-review') {
    return 'conclude-block';
  }
  if (message === 'Block concluded.' && feedbackOrigin === 'today-close-review') {
    return 'conclude-block-without-review';
  }
  if (message === 'Task added.' || /^Task added to .+\.$/.test(message)) {
    return feedbackOrigin === 'today-day-sheet' ? 'create-task' : 'today-create-task';
  }

  return undefined;
}

export function resolveTodayLocalFeedback(
  draft: Pick<TodayActionDraft, 'action'> | undefined,
  actionError: string | null,
  statusMessage: string | null,
  feedbackOrigin?: string | null,
): TodayLocalFeedback {
  const successAction = statusMessage
    ? resolveTodaySuccessAction(statusMessage, feedbackOrigin)
    : undefined;

  return {
    ...(draft && actionError !== null
      ? { actionError: { action: draft.action, message: actionError } }
      : actionError !== null && feedbackOrigin === 'today-close-review'
        ? { actionError: { action: 'conclude-block', message: actionError } }
        : {}),
    ...(successAction && statusMessage
      ? { statusMessage: { action: successAction, message: statusMessage } }
      : {}),
  };
}
