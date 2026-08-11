export type TodayBlockActionDraft = {
  action: 'create-highlighted-event' | 'create-task';
  blockId: string;
  title: string;
};

type RecoveryDocument = Pick<Document, 'querySelectorAll'>;
type ValueControl = HTMLInputElement;

export function isTodayBlockActionDraft(value: unknown): value is TodayBlockActionDraft {
  if (!value || typeof value !== 'object') return false;

  const draft = value as Record<string, unknown>;
  if (typeof draft.blockId !== 'string' || typeof draft.action !== 'string') return false;

  return (
    (draft.action === 'create-highlighted-event' || draft.action === 'create-task') &&
    typeof draft.title === 'string'
  );
}

export function restoreTodayBlockActionDraft(
  draft: TodayBlockActionDraft,
  document: RecoveryDocument,
): void {
  const form = Array.from(
    document.querySelectorAll<HTMLFormElement>('[data-today-block-action]'),
  ).find(
    (candidate) =>
      candidate.dataset.todayBlockId === draft.blockId &&
      candidate.dataset.todayBlockAction === draft.action,
  );

  if (!form) return;

  const details = form.closest('details') as HTMLDetailsElement | null;
  if (details) details.open = true;

  restoreValue(form, 'title', draft.title);
}

function restoreValue(form: HTMLFormElement, name: string, value: string): void {
  for (const control of form.querySelectorAll<ValueControl>(`[name="${name}"]`)) {
    control.value = value;
  }
}
