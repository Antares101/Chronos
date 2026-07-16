type Focusable = EventTarget & { focus: (options?: FocusOptions) => void };
type ShortcutDialog = HTMLDialogElement & {
  querySelector: (selector: string) => Focusable | null;
  querySelectorAll: (selector: string) => ArrayLike<Focusable>;
};
type ShortcutRoot = Pick<Document, 'addEventListener' | 'removeEventListener' | 'querySelector'>;

const editableTags = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'SUMMARY']);

export function bindTodayShortcuts(root: ShortcutRoot): () => void {
  const trigger = root.querySelector('[data-today-shortcuts-trigger]') as
    (Focusable & EventTarget) | null;
  const dialog = root.querySelector('[data-today-shortcuts-dialog]') as ShortcutDialog | null;
  const closeButton = root.querySelector('[data-today-shortcuts-close]') as
    (Focusable & EventTarget) | null;
  if (!trigger || !dialog || !closeButton) return () => {};

  let invoker: Focusable | null = null;
  const open = (source: Focusable) => {
    if (dialog.open) return;
    invoker = source;
    dialog.showModal();
    const closeControl = dialog.querySelector(
      '[data-today-shortcuts-close]',
    ) as unknown as Focusable | null;
    closeControl?.focus({ preventScroll: true });
  };
  const close = () => {
    if (!dialog.open) return;
    dialog.close();
    invoker?.focus({ preventScroll: true });
    invoker = null;
  };
  const onClick = (event: Event) => {
    if (event.currentTarget === trigger) open(trigger);
    if (event.currentTarget === closeButton) close();
  };
  const onKeydown = (event: KeyboardEvent) => {
    if (dialog.open) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'Tab') {
        containDialogFocus(event, dialog);
      }
      return;
    }
    if (!canHandleShortcut(event)) return;
    if (event.key === '?') open(event.target as unknown as Focusable);
    else if (event.key === 'a') focus(root, '#today-active-block');
    else if (event.key === 'i')
      focus(root, '#today-open-tasks summary') || focus(root, '#today-task-inbox-title');
    else if (event.key === 'q') focus(root, '#today-quick-task-title');
    else if (event.key === 'b') focus(root, '#today-quick-block-title');
    else if (event.key === 'c') focusCloseReview(root);
    else return;
    event.preventDefault();
  };

  trigger.addEventListener('click', onClick);
  closeButton.addEventListener('click', onClick);
  root.addEventListener('keydown', onKeydown);
  return () => {
    trigger.removeEventListener('click', onClick);
    closeButton.removeEventListener('click', onClick);
    root.removeEventListener('keydown', onKeydown);
  };
}

function canHandleShortcut(event: KeyboardEvent) {
  return (
    !event.defaultPrevented &&
    !event.repeat &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    !isNativeTarget(event.target)
  );
}

function isNativeTarget(target: EventTarget | null) {
  const element = target as
    (Partial<HTMLElement> & { closest?: (selector: string) => Element | null }) | null;
  return (
    !element ||
    element.isContentEditable ||
    editableTags.has(element.tagName ?? '') ||
    element.closest?.(
      'input, textarea, select, button, a, summary, [contenteditable], [role="textbox"], dialog[open]',
    ) !== null
  );
}

function containDialogFocus(event: KeyboardEvent, dialog: ShortcutDialog) {
  const focusables = Array.from(
    dialog.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ) as unknown as Focusable[];
  const first = focusables[0];
  const last = focusables.at(-1);
  if (!first || !last) return;
  if (
    focusables.length === 1 ||
    (!event.shiftKey && event.target === last) ||
    (event.shiftKey && event.target === first)
  ) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus({ preventScroll: true });
  }
}

function focus(root: ShortcutRoot, selector: string) {
  const target = root.querySelector(selector) as Focusable | null;
  if (!target) return false;
  target.focus({ preventScroll: true });
  return true;
}

function focusCloseReview(root: ShortcutRoot) {
  const review = root.querySelector('[data-today-close-review]') as
    (HTMLDetailsElement & { querySelector: (selector: string) => Focusable | null }) | null;
  if (!review) return;
  review.open = true;
  review.querySelector('summary')?.focus({ preventScroll: true });
}
