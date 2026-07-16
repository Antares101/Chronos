type TodayFocusStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;
type RestorationDocument = Pick<Document, 'getElementById'>;
type Disclosure = Pick<HTMLDetailsElement, 'open' | 'querySelector'>;

export function focusTodayRestorationTarget(section: HTMLElement): void {
  const invalidControl = section.querySelector<HTMLElement>('[aria-invalid="true"]');

  (invalidControl ?? section).focus({ preventScroll: true });
}

export function closeTodayDisclosure(details: Disclosure): void {
  details.open = false;
  details.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
}

export function persistTodayFocusTarget(
  storage: TodayFocusStorage | undefined,
  key: string,
  targetId: string,
): void {
  try {
    storage?.setItem(key, targetId);
  } catch {}
}

export function persistTodayFocusTargetForSubmit(
  event: Pick<SubmitEvent, 'defaultPrevented'>,
  storage: TodayFocusStorage | undefined,
  key: string,
  targetId: string,
): void {
  if (event.defaultPrevented) return;

  persistTodayFocusTarget(storage, key, targetId);
}

export function restoreTodayFocus(
  storage: TodayFocusStorage | undefined,
  key: string,
  document: RestorationDocument,
): void {
  let targetId: string | null | undefined;

  try {
    targetId = storage?.getItem(key);
  } catch {
    return;
  }

  if (!targetId) return;

  try {
    storage?.removeItem(key);
  } catch {
    return;
  }

  const target = document.getElementById(targetId);
  if (target) focusTodayRestorationTarget(target);
}
