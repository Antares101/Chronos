const LAST_SAME_DAY_MINUTE = 23 * 60 + 59;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const WINDOW_UNAVAILABLE_LABEL = 'Select a date and time';
const DURATION_UNAVAILABLE_LABEL = 'Duration unavailable';
const READY_STATUS_LABEL = 'Ready.';
const MISSING_DATE_STATUS_LABEL = 'Choose a date to preview the block.';
const MISSING_TIME_STATUS_LABEL = 'Choose a start and end time to preview the block.';
const INVALID_TIME_STATUS_LABEL = 'Use a valid HH:mm time.';
const INVALID_RANGE_STATUS_LABEL = 'End time must be after start time.';
const CLAMPED_STATUS_LABEL = 'Adjusted to the end of the day.';
const INVALID_SHORTCUT_STATUS_LABEL = 'Choose a valid start time first.';
const READABLE_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export type QuickSchedulePreview = {
  windowLabel: string;
  durationLabel: string;
  statusLabel: string;
  isValidRange: boolean;
};

type QuickScheduleInput = {
  date: string;
  todayDate: string;
  startTime: string;
  endTime: string;
};

export type QuickScheduleSelectorBinding = {
  refresh: () => void;
};

export type QuickScheduleSelectorRoot = {
  dataset?: { todayDate?: string };
  querySelector: (selector: string) => unknown;
  querySelectorAll: (selector: string) => ArrayLike<unknown>;
};

type QuickScheduleSelectorParent = {
  querySelectorAll: (selector: string) => ArrayLike<unknown>;
};

type InputTarget = {
  value: string;
  addEventListener: (type: 'input' | 'change', listener: () => void) => void;
  setCustomValidity?: (message: string) => void;
};

type TextTarget = {
  textContent: string | null;
};

type ShortcutButton = {
  dataset?: { durationMinutes?: string };
  addEventListener: (type: 'click', listener: () => void) => void;
};

type RecentNameButton = {
  dataset?: { recentBlockName?: string };
  addEventListener: (type: 'click', listener: () => void) => void;
};

export function buildQuickSchedulePreview(input: QuickScheduleInput): QuickSchedulePreview {
  const date = input.date.trim();
  const startTime = input.startTime;
  const endTime = input.endTime;

  if (date.length === 0) {
    return invalidPreview(MISSING_DATE_STATUS_LABEL);
  }

  if (startTime.length === 0 || endTime.length === 0) {
    return invalidPreview(MISSING_TIME_STATUS_LABEL);
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return invalidPreview(INVALID_TIME_STATUS_LABEL);
  }

  const windowLabel = formatWindowLabel({ date, todayDate: input.todayDate, startTime, endTime });

  if (endMinutes <= startMinutes) {
    return {
      windowLabel,
      durationLabel: DURATION_UNAVAILABLE_LABEL,
      statusLabel: INVALID_RANGE_STATUS_LABEL,
      isValidRange: false,
    };
  }

  return {
    windowLabel,
    durationLabel: formatDuration(endMinutes - startMinutes),
    statusLabel: READY_STATUS_LABEL,
    isValidRange: true,
  };
}

export function getDurationShortcutEndTime(input: {
  startTime: string;
  durationMinutes: number;
}): { endTime: string; wasClamped: boolean } | null {
  if (!Number.isFinite(input.durationMinutes) || !Number.isInteger(input.durationMinutes)) {
    return null;
  }

  if (input.durationMinutes <= 0) {
    return null;
  }

  const startMinutes = parseTimeToMinutes(input.startTime);

  if (startMinutes === null || startMinutes >= LAST_SAME_DAY_MINUTE) {
    return null;
  }

  const requestedEndMinutes = startMinutes + input.durationMinutes;
  const clampedEndMinutes = Math.min(requestedEndMinutes, LAST_SAME_DAY_MINUTE);

  return {
    endTime: formatTime(clampedEndMinutes),
    wasClamped: requestedEndMinutes > LAST_SAME_DAY_MINUTE,
  };
}

export function bindQuickScheduleSelector(
  root: QuickScheduleSelectorRoot,
): QuickScheduleSelectorBinding | null {
  const titleInput = asInputTarget(root.querySelector('[data-quick-block-title]'));
  const dateInput = asInputTarget(root.querySelector('[data-quick-schedule-date]'));
  const startInput = asInputTarget(root.querySelector('[data-quick-schedule-start]'));
  const endInput = asInputTarget(root.querySelector('[data-quick-schedule-end]'));
  const windowTarget = asTextTarget(root.querySelector('[data-quick-schedule-window]'));
  const durationTarget = asTextTarget(root.querySelector('[data-quick-schedule-duration]'));
  const statusTarget = asTextTarget(root.querySelector('[data-quick-schedule-status]'));

  if (!dateInput || !startInput || !endInput || !windowTarget || !durationTarget || !statusTarget) {
    return null;
  }

  const render = (statusOverride?: string) => {
    const preview = buildQuickSchedulePreview({
      date: dateInput.value,
      todayDate: root.dataset?.todayDate ?? '',
      startTime: startInput.value,
      endTime: endInput.value,
    });

    windowTarget.textContent = preview.windowLabel;
    durationTarget.textContent = preview.durationLabel;
    statusTarget.textContent = statusOverride ?? preview.statusLabel;
    endInput.setCustomValidity?.(preview.isValidRange ? '' : preview.statusLabel);
  };

  const shortcutButtons = toArray(root.querySelectorAll('[data-duration-minutes]'))
    .map(asShortcutButton)
    .filter((button): button is ShortcutButton => button !== null);

  for (const input of [dateInput, startInput, endInput]) {
    input.addEventListener('input', () => render());
    input.addEventListener('change', () => render());
  }

  const recentNameButtons = titleInput
    ? toArray(root.querySelectorAll('[data-recent-block-name]'))
        .map(asRecentNameButton)
        .filter((button): button is RecentNameButton => button !== null)
    : [];

  for (const button of recentNameButtons) {
    button.addEventListener('click', () => {
      if (titleInput && button.dataset?.recentBlockName) {
        titleInput.value = button.dataset.recentBlockName;
      }
    });
  }

  for (const button of shortcutButtons) {
    button.addEventListener('click', () => {
      const durationMinutes = Number(button.dataset?.durationMinutes);
      const shortcut = getDurationShortcutEndTime({
        startTime: startInput.value,
        durationMinutes,
      });

      if (!shortcut) {
        render(INVALID_SHORTCUT_STATUS_LABEL);
        return;
      }

      endInput.value = shortcut.endTime;
      render(shortcut.wasClamped ? CLAMPED_STATUS_LABEL : undefined);
    });
  }

  render();

  return { refresh: render };
}

export function bindQuickScheduleSelectors(
  root: QuickScheduleSelectorParent,
): QuickScheduleSelectorBinding[] {
  return toArray(root.querySelectorAll('[data-quick-schedule-selector]')).flatMap((candidate) => {
    const bindingRoot = asScheduleRoot(candidate);

    if (!bindingRoot) {
      return [];
    }

    const binding = bindQuickScheduleSelector(bindingRoot);
    return binding ? [binding] : [];
  });
}

function invalidPreview(statusLabel: string): QuickSchedulePreview {
  return {
    windowLabel: WINDOW_UNAVAILABLE_LABEL,
    durationLabel: DURATION_UNAVAILABLE_LABEL,
    statusLabel,
    isValidRange: false,
  };
}

function parseTimeToMinutes(value: string): number | null {
  if (!TIME_PATTERN.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatWindowLabel(input: {
  date: string;
  todayDate: string;
  startTime: string;
  endTime: string;
}): string {
  const dateLabel = input.date === input.todayDate ? 'Today' : formatReadableDate(input.date);
  return `${dateLabel}, ${input.startTime}–${input.endTime}`;
}

function formatReadableDate(date: string): string {
  const parts = parseDateParts(date);

  if (!parts) {
    return date;
  }

  return READABLE_DATE_FORMATTER.format(new Date(parts.year, parts.month - 1, parts.day));
}

function parseDateParts(date: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function toArray(value: ArrayLike<unknown>): unknown[] {
  return Array.from({ length: value.length }, (_, index) => value[index]);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asInputTarget(value: unknown): InputTarget | null {
  if (!isObject(value)) {
    return null;
  }

  if (typeof value.value !== 'string' || typeof value.addEventListener !== 'function') {
    return null;
  }

  return value as InputTarget;
}

function asTextTarget(value: unknown): TextTarget | null {
  if (!isObject(value) || !('textContent' in value)) {
    return null;
  }

  return value as TextTarget;
}

function asShortcutButton(value: unknown): ShortcutButton | null {
  if (!isObject(value) || typeof value.addEventListener !== 'function') {
    return null;
  }

  return value as ShortcutButton;
}

function asRecentNameButton(value: unknown): RecentNameButton | null {
  if (!isObject(value) || typeof value.addEventListener !== 'function') {
    return null;
  }

  return value as RecentNameButton;
}

function asScheduleRoot(value: unknown): QuickScheduleSelectorRoot | null {
  if (!isObject(value)) {
    return null;
  }

  if (typeof value.querySelector !== 'function' || typeof value.querySelectorAll !== 'function') {
    return null;
  }

  return value as QuickScheduleSelectorRoot;
}
