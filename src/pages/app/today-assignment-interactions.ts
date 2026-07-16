type AssignmentListenerTarget = {
  addEventListener: (type: string, listener: AssignmentListener) => void;
  removeEventListener: (type: string, listener: AssignmentListener) => void;
};

type AssignmentNode = AssignmentListenerTarget & {
  dataset?: Record<string, string | undefined>;
  value?: string;
  textContent?: string | null;
  draggable?: boolean;
  open?: boolean;
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
  closest?: (selector: string) => unknown;
  focus?: (options?: { preventScroll?: boolean }) => void;
  querySelector?: (selector: string) => unknown;
  querySelectorAll?: (selector: string) => ArrayLike<unknown>;
  requestSubmit?: () => void;
};

type AssignmentListener = (event: Record<string, unknown>) => void;

export type TodayAssignmentInteractionsRoot = {
  defaultView?: { matchMedia?: (query: string) => { matches: boolean } } | null;
  documentElement?: AssignmentNode;
  addEventListener: (type: string, listener: AssignmentListener) => void;
  removeEventListener: (type: string, listener: AssignmentListener) => void;
  querySelector: (selector: string) => unknown;
  querySelectorAll: (selector: string) => ArrayLike<unknown>;
};

export type TodayAssignmentInteractionsBinding = { destroy: () => void };

const bindings = new WeakMap<object, TodayAssignmentInteractionsBinding>();

export function bindTodayAssignmentInteractions(
  root: TodayAssignmentInteractionsRoot,
): TodayAssignmentInteractionsBinding | null {
  if (root.defaultView?.matchMedia?.('(pointer: coarse)').matches) return null;
  const existing = bindings.get(root);
  if (existing) return existing;

  const tasks = nodes(root.querySelectorAll('[data-assignment-task]'));
  const targets = nodes(root.querySelectorAll('[data-assignment-target]'));
  const forms = nodes(root.querySelectorAll('[data-today-inbox-assignment]'));
  const feedback = node(root.querySelector('[data-today-inbox-drag-feedback]'));
  const submittedTaskIds = new Set<string>();
  let activeTaskId: string | null = null;
  const listeners: Array<[AssignmentListenerTarget, string, AssignmentListener]> = [];

  const listen = (target: AssignmentListenerTarget, type: string, listener: AssignmentListener) => {
    target.addEventListener(type, listener);
    listeners.push([target, type, listener]);
  };
  const setFeedback = (message: string) => {
    if (feedback) feedback.textContent = message;
  };
  const clear = (includeSubmitting = false) => {
    activeTaskId = null;
    root.documentElement?.removeAttribute('data-assignment-dragging');
    for (const target of targets) target.removeAttribute('data-assignment-state');
    if (includeSubmitting) {
      for (const form of forms) {
        form.removeAttribute('data-assignment-state');
        form.removeAttribute('aria-busy');
      }
    }
    setFeedback('');
  };
  const assignment = (target: AssignmentNode) => {
    const taskId = activeTaskId;
    const blockId = target.dataset?.assignmentTarget;
    const form = forms.find((candidate) => candidate.dataset?.assignmentTaskId === taskId);
    const select = node(form?.querySelector?.('select[name="blockId"]'));
    const optionValues = nodes(form?.querySelectorAll?.('option')).map((option) => option.value);
    if (!taskId || !blockId || !form || !select || !optionValues.includes(blockId)) return null;
    return { blockId, form, select, taskId };
  };
  const reject = (target: AssignmentNode) => {
    target.setAttribute('data-assignment-state', 'rejected');
    setFeedback('This block is no longer available.');
  };

  for (const task of tasks) {
    task.draggable = true;
    listen(task, 'dragstart', () => {
      const taskId = task.dataset?.assignmentTask;
      if (
        !taskId ||
        submittedTaskIds.has(taskId) ||
        !forms.some((form) => form.dataset?.assignmentTaskId === taskId)
      )
        return;
      activeTaskId = taskId;
      root.documentElement?.setAttribute('data-assignment-dragging', 'true');
      setFeedback('Choose a block on the day sheet.');
    });
    listen(task, 'dragend', () => clear());
  }
  for (const target of targets) {
    listen(target, 'dragover', (event) => {
      const candidate = assignment(target);
      if (!candidate) return reject(target);
      prevent(event);
      target.setAttribute('data-assignment-state', 'valid');
      setFeedback(`Assign to ${target.dataset?.assignmentTargetLabel ?? candidate.blockId}.`);
    });
    listen(target, 'drop', (event) => {
      const candidate = assignment(target);
      if (!candidate || submittedTaskIds.has(candidate.taskId)) return reject(target);
      prevent(event);
      candidate.select.value = candidate.blockId;
      submittedTaskIds.add(candidate.taskId);
      target.setAttribute('data-assignment-state', 'valid');
      candidate.form.setAttribute('data-assignment-state', 'submitting');
      candidate.form.setAttribute('aria-busy', 'true');
      setFeedback(`Assigning to ${target.dataset?.assignmentTargetLabel ?? candidate.blockId}.`);
      candidate.form.requestSubmit?.();
    });
  }
  listen(root, 'keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeOpenAssignmentDisclosure(event);
    clear();
  });

  const binding = {
    destroy() {
      for (const [target, type, listener] of listeners) target.removeEventListener(type, listener);
      clear(true);
      bindings.delete(root);
    },
  };
  bindings.set(root, binding);
  return binding;
}

function nodes(value: ArrayLike<unknown> | undefined): AssignmentNode[] {
  return Array.from({ length: value?.length ?? 0 }, (_, index) => node(value?.[index])).filter(
    (candidate): candidate is AssignmentNode => candidate !== null,
  );
}

function node(value: unknown): AssignmentNode | null {
  return typeof value === 'object' && value !== null && 'addEventListener' in value
    ? (value as AssignmentNode)
    : null;
}

function closeOpenAssignmentDisclosure(event: Record<string, unknown>): boolean {
  const target = node(event.target);
  const details = node(target?.closest?.('details[open]'));
  if (!details?.querySelector?.('[data-today-inbox-assignment]')) return false;
  details.open = false;
  node(details.querySelector('summary'))?.focus?.({ preventScroll: true });
  prevent(event);
  return true;
}

function prevent(event: Record<string, unknown>): void {
  if (typeof event.preventDefault === 'function') event.preventDefault();
}
