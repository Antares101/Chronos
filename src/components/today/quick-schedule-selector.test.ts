import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  bindQuickScheduleSelector,
  bindQuickScheduleSelectors,
  buildQuickSchedulePreview,
  getDurationShortcutEndTime,
} from './quick-schedule-selector';

class FakeInput {
  listeners = new Map<string, (() => void)[]>();
  validationMessage = '';
  constructor(public value: string) {}
  addEventListener(type: 'input' | 'change', listener: () => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  setCustomValidity(message: string): void {
    this.validationMessage = message;
  }
  dispatch(type: 'input' | 'change'): void {
    for (const listener of this.listeners.get(type) ?? []) listener();
  }
}

class FakeTextTarget {
  constructor(public textContent: string | null = null) {}
}

class FakeButton {
  dataset: { durationMinutes?: string };
  listeners = new Map<string, (() => void)[]>();
  constructor(durationMinutes: string) {
    this.dataset = { durationMinutes };
  }
  addEventListener(type: 'click', listener: () => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  click(): void {
    for (const listener of this.listeners.get('click') ?? []) listener();
  }
}

type Nodes = ReturnType<typeof createNodes>;

class FakeScheduleRoot {
  dataset: { todayDate?: string };
  selectorsSeen: string[] = [];

  constructor(private readonly nodes: Partial<Nodes> = {}) {
    this.dataset = { todayDate: nodes.todayDate };
  }

  querySelector(selector: string): unknown {
    this.selectorsSeen.push(selector);
    return new Map<string, unknown>([
      ['[data-quick-schedule-date]', this.nodes.date],
      ['[data-quick-schedule-start]', this.nodes.start],
      ['[data-quick-schedule-end]', this.nodes.end],
      ['[data-quick-schedule-window]', this.nodes.window],
      ['[data-quick-schedule-duration]', this.nodes.duration],
      ['[data-quick-schedule-status]', this.nodes.status],
    ]).get(selector);
  }

  querySelectorAll(selector: string): unknown[] {
    this.selectorsSeen.push(selector);
    return selector === '[data-duration-minutes]' ? (this.nodes.buttons ?? []) : [];
  }
}

class FakeDocumentRoot {
  selectorsSeen: string[] = [];
  constructor(private readonly roots: FakeScheduleRoot[]) {}
  querySelectorAll(selector: string): unknown[] {
    this.selectorsSeen.push(selector);
    return selector === '[data-quick-schedule-selector]' ? this.roots : [];
  }
}

function createNodes() {
  return {
    date: new FakeInput('2026-07-06'),
    start: new FakeInput('09:00'),
    end: new FakeInput('10:00'),
    window: new FakeTextTarget(),
    duration: new FakeTextTarget(),
    status: new FakeTextTarget(),
    buttons: [
      new FakeButton('30'),
      new FakeButton('60'),
      new FakeButton('90'),
      new FakeButton('120'),
    ],
    todayDate: '2026-07-06',
  };
}

function createScheduleRoot(overrides: Partial<Nodes> = {}) {
  const nodes = { ...createNodes(), ...overrides };
  return { nodes, root: new FakeScheduleRoot(nodes) };
}

function readTodayPageSource(): string {
  return readFileSync(new URL('../../pages/app/today.astro', import.meta.url), 'utf8');
}

function getCreateBlockSource(source = readTodayPageSource()): string {
  const sectionStart = source.indexOf('<h3>Create block here</h3>');
  const sectionEnd = source.indexOf('<article class="action-card">', sectionStart + 1);

  expect(sectionStart).toBeGreaterThanOrEqual(0);
  expect(sectionEnd).toBeGreaterThan(sectionStart);

  return source.slice(sectionStart, sectionEnd);
}

describe('quick schedule preview helpers', () => {
  it('builds valid Today and selected-date previews with duration labels', () => {
    expect(
      buildQuickSchedulePreview({
        date: '2026-07-06',
        todayDate: '2026-07-06',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ).toEqual({
      windowLabel: 'Today, 09:00–10:00',
      durationLabel: '1h',
      statusLabel: 'Ready.',
      isValidRange: true,
    });
    expect(
      buildQuickSchedulePreview({
        date: '2026-07-07',
        todayDate: '2026-07-06',
        startTime: '09:15',
        endTime: '10:45',
      }),
    ).toMatchObject({ windowLabel: 'Jul 7, 2026, 09:15–10:45', durationLabel: '1h 30m' });
  });

  it.each([
    ['2026-07-07', 'Jul 7, 2026'],
    ['2026-12-31', 'Dec 31, 2026'],
  ])('formats non-today date %s from local date parts', (date, dateLabel) => {
    expect(
      buildQuickSchedulePreview({
        date,
        todayDate: '2026-07-06',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ).toMatchObject({ windowLabel: `${dateLabel}, 09:00–10:00` });
  });

  it.each([
    ['', '09:00', '10:00', 'Choose a date to preview the block.'],
    ['2026-07-06', '', '10:00', 'Choose a start and end time to preview the block.'],
    ['2026-07-06', '09:00', '', 'Choose a start and end time to preview the block.'],
  ])(
    'shows visible incomplete status for date=%s start=%s end=%s',
    (date, startTime, endTime, statusLabel) => {
      expect(
        buildQuickSchedulePreview({ date, todayDate: '2026-07-06', startTime, endTime }),
      ).toMatchObject({
        windowLabel: 'Select a date and time',
        durationLabel: 'Duration unavailable',
        statusLabel,
        isValidRange: false,
      });
    },
  );

  it.each(['9:00', '24:00', '12:60', 'nope'])(
    'rejects malformed HH:mm value %s instead of normalizing it',
    (malformedTime) => {
      for (const [startTime, endTime] of [
        [malformedTime, '10:00'],
        ['09:00', malformedTime],
      ]) {
        expect(
          buildQuickSchedulePreview({
            date: '2026-07-06',
            todayDate: '2026-07-06',
            startTime,
            endTime,
          }),
        ).toMatchObject({
          windowLabel: 'Select a date and time',
          durationLabel: 'Duration unavailable',
          statusLabel: 'Use a valid HH:mm time.',
          isValidRange: false,
        });
      }
    },
  );

  it.each([' 09:00', '09:00 ', ' 09:00 '])(
    'rejects whitespace-padded HH:mm value %s instead of trimming it',
    (paddedTime) => {
      for (const [startTime, endTime] of [
        [paddedTime, '10:00'],
        ['09:00', paddedTime],
      ]) {
        expect(
          buildQuickSchedulePreview({
            date: '2026-07-06',
            todayDate: '2026-07-06',
            startTime,
            endTime,
          }),
        ).toMatchObject({
          windowLabel: 'Select a date and time',
          durationLabel: 'Duration unavailable',
          statusLabel: 'Use a valid HH:mm time.',
          isValidRange: false,
        });
      }
    },
  );

  it.each([
    ['00:00', '00:30', '30m'],
    ['23:00', '23:59', '59m'],
  ])('handles valid day-boundary range %s to %s', (startTime, endTime, durationLabel) => {
    expect(
      buildQuickSchedulePreview({
        date: '2026-07-06',
        todayDate: '2026-07-06',
        startTime,
        endTime,
      }),
    ).toMatchObject({
      windowLabel: `Today, ${startTime}–${endTime}`,
      durationLabel,
      statusLabel: 'Ready.',
      isValidRange: true,
    });
  });

  it.each(['09:00', '08:59'])('marks end time %s as an invalid visible range', (endTime) => {
    expect(
      buildQuickSchedulePreview({
        date: '2026-07-06',
        todayDate: '2026-07-06',
        startTime: '09:00',
        endTime,
      }),
    ).toMatchObject({
      windowLabel: `Today, 09:00–${endTime}`,
      durationLabel: 'Duration unavailable',
      statusLabel: 'End time must be after start time.',
      isValidRange: false,
    });
  });
});

describe('quick schedule duration shortcuts', () => {
  it.each([
    [30, '10:30'],
    [60, '11:00'],
    [90, '11:30'],
    [120, '12:00'],
  ])('adds %i minutes to a valid start time', (durationMinutes, endTime) => {
    expect(getDurationShortcutEndTime({ startTime: '10:00', durationMinutes })).toEqual({
      endTime,
      wasClamped: false,
    });
  });

  it('clamps near-midnight shortcuts to the last same-day minute', () => {
    expect(getDurationShortcutEndTime({ startTime: '23:45', durationMinutes: 60 })).toEqual({
      endTime: '23:59',
      wasClamped: true,
    });
  });

  it.each([0, -15, Number.NaN, Number.POSITIVE_INFINITY, 12.5])(
    'returns null for invalid duration %s',
    (durationMinutes) => {
      expect(getDurationShortcutEndTime({ startTime: '10:00', durationMinutes })).toBeNull();
    },
  );

  it.each(['', '9:00', '24:00', '12:60', 'nope', '23:59'])(
    'returns null for invalid start %s',
    (startTime) => {
      expect(getDurationShortcutEndTime({ startTime, durationMinutes: 30 })).toBeNull();
    },
  );

  it.each([' 09:00', '09:00 ', ' 09:00 '])(
    'returns null for whitespace-padded start %s instead of trimming it',
    (startTime) => {
      expect(getDurationShortcutEndTime({ startTime, durationMinutes: 30 })).toBeNull();
    },
  );
});

describe('quick schedule selector binder', () => {
  it('queries selector roots under the provided document-like root and binds each root', () => {
    const first = createScheduleRoot();
    const second = createScheduleRoot({
      start: new FakeInput('11:00'),
      end: new FakeInput('12:00'),
    });
    const documentLike = new FakeDocumentRoot([first.root, second.root]);

    const bindings = bindQuickScheduleSelectors(documentLike as never);

    expect(documentLike.selectorsSeen).toEqual(['[data-quick-schedule-selector]']);
    expect(bindings).toHaveLength(2);
    expect(first.nodes.window.textContent).toBe('Today, 09:00–10:00');
    expect(second.nodes.window.textContent).toBe('Today, 11:00–12:00');
  });

  it('updates preview text when schedule inputs change', () => {
    const { nodes, root } = createScheduleRoot();

    bindQuickScheduleSelector(root as never);
    nodes.start.value = '09:30';
    nodes.end.value = '11:00';
    nodes.start.dispatch('input');

    expect(nodes.window.textContent).toBe('Today, 09:30–11:00');
    expect(nodes.duration.textContent).toBe('1h 30m');
    expect(nodes.status.textContent).toBe('Ready.');
  });

  it('updates visible status and native end-time validity when manual end time creates an invalid range', () => {
    const { nodes, root } = createScheduleRoot();

    bindQuickScheduleSelector(root as never);
    nodes.end.value = '08:30';
    nodes.end.dispatch('change');

    expect(nodes.window.textContent).toBe('Today, 09:00–08:30');
    expect(nodes.duration.textContent).toBe('Duration unavailable');
    expect(nodes.status.textContent).toBe('End time must be after start time.');
    expect(nodes.end.validationMessage).toBe('End time must be after start time.');

    nodes.end.value = '10:15';
    nodes.end.dispatch('input');

    expect(nodes.status.textContent).toBe('Ready.');
    expect(nodes.end.validationMessage).toBe('');
  });

  it('updates the existing end time input when a duration shortcut is clicked', () => {
    const { nodes, root } = createScheduleRoot();

    bindQuickScheduleSelector(root as never);
    nodes.buttons[2]?.click();

    expect(nodes.end.value).toBe('10:30');
    expect(nodes.window.textContent).toBe('Today, 09:00–10:30');
    expect(nodes.duration.textContent).toBe('1h 30m');
    expect(nodes.end.validationMessage).toBe('');
  });

  it('shows a clamp status and writes 23:59 near midnight', () => {
    const { nodes, root } = createScheduleRoot({
      start: new FakeInput('23:45'),
      end: new FakeInput('23:59'),
    });

    bindQuickScheduleSelector(root as never);
    nodes.buttons[1]?.click();

    expect(nodes.end.value).toBe('23:59');
    expect(nodes.window.textContent).toBe('Today, 23:45–23:59');
    expect(nodes.duration.textContent).toBe('14m');
    expect(nodes.status.textContent).toBe('Adjusted to the end of the day.');
  });

  it('keeps manual edits possible after a shortcut changes the end time', () => {
    const { nodes, root } = createScheduleRoot();

    bindQuickScheduleSelector(root as never);
    nodes.buttons[1]?.click();
    nodes.end.value = '10:45';
    nodes.end.dispatch('input');

    expect(nodes.end.value).toBe('10:45');
    expect(nodes.window.textContent).toBe('Today, 09:00–10:45');
    expect(nodes.duration.textContent).toBe('1h 45m');
    expect(nodes.status.textContent).toBe('Ready.');
  });

  it('returns null and does not throw when required nodes are absent', () => {
    const root = new FakeScheduleRoot({
      date: new FakeInput('2026-07-06'),
      start: new FakeInput('09:00'),
    });

    expect(() => bindQuickScheduleSelector(root as never)).not.toThrow();
    expect(bindQuickScheduleSelector(root as never)).toBeNull();
  });
});

describe('Today page quick schedule source contract', () => {
  it('preserves the existing create-planned-block form action and field names', () => {
    const createBlockSource = getCreateBlockSource();

    expect(createBlockSource).toContain('value="create-planned-block"');
    for (const fieldName of ['title', 'category', 'date', 'startTime', 'endTime']) {
      expect(createBlockSource).toMatch(new RegExp(`name="${fieldName}"`));
    }
  });

  it('renders a fieldset selector with native required inputs, live preview, status, and duration shortcuts', () => {
    const createBlockSource = getCreateBlockSource();

    expect(createBlockSource).toMatch(/<fieldset[\s\S]*data-quick-schedule-selector/);
    expect(createBlockSource).toContain('data-today-date={appState.todayDate}');
    expect(createBlockSource).toMatch(/<legend>\s*Schedule\s*<\/legend>/);
    expect(createBlockSource).toMatch(
      /<output[\s\S]*for="quick-block-date quick-block-start quick-block-end"[\s\S]*aria-live="polite"/,
    );
    expect(createBlockSource).toMatch(/data-quick-schedule-window/);
    expect(createBlockSource).toMatch(/data-quick-schedule-duration/);
    expect(createBlockSource).toMatch(
      /data-quick-schedule-status[\s\S]*role="status"[\s\S]*aria-live="polite"/,
    );

    for (const [id, name, type, dataAttribute] of [
      ['quick-block-date', 'date', 'date', 'data-quick-schedule-date'],
      ['quick-block-start', 'startTime', 'time', 'data-quick-schedule-start'],
      ['quick-block-end', 'endTime', 'time', 'data-quick-schedule-end'],
    ]) {
      expect(createBlockSource).toMatch(
        new RegExp(
          `<input[\\s\\S]*id="${id}"[\\s\\S]*${dataAttribute}[\\s\\S]*name="${name}"[\\s\\S]*type="${type}"[\\s\\S]*required`,
        ),
      );
    }

    expect(createBlockSource).toMatch(
      /<div class="quick-schedule__shortcuts"[\s\S]*role="group"[\s\S]*aria-label="Duration shortcuts"/,
    );

    for (const [durationMinutes, ariaLabel] of [
      ['30', 'Set duration to 30 minutes'],
      ['60', 'Set duration to 60 minutes'],
      ['90', 'Set duration to 90 minutes'],
      ['120', 'Set duration to 120 minutes'],
    ]) {
      expect(createBlockSource).toMatch(
        new RegExp(
          `<button[\\s\\S]*type="button"[\\s\\S]*data-duration-minutes="${durationMinutes}"[\\s\\S]*aria-label="${ariaLabel}"`,
        ),
      );
    }

    const orderedNeedles = [
      'name="title"',
      'name="category"',
      'id="quick-block-date"',
      'id="quick-block-start"',
      'id="quick-block-end"',
      'data-duration-minutes="30"',
      '<button type="submit">Create block</button>',
    ];
    const positions = orderedNeedles.map((needle) => createBlockSource.indexOf(needle));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });

  it('keeps explicit labels for each schedule input and wires the production binder after markup exists', () => {
    const todaySource = readTodayPageSource();
    const createBlockSource = getCreateBlockSource(todaySource);

    for (const [id, labelText] of [
      ['quick-block-date', 'Date'],
      ['quick-block-start', 'Start'],
      ['quick-block-end', 'End'],
    ]) {
      const labelSource = `<label for="${id}">${labelText}</label>`;
      const labelIndex = createBlockSource.indexOf(labelSource);
      const inputIndex = createBlockSource.indexOf(`id="${id}"`);

      expect(labelIndex).toBeGreaterThanOrEqual(0);
      expect(inputIndex).toBeGreaterThan(labelIndex);
      expect(createBlockSource).toMatch(
        new RegExp(
          `<input[\\s\\S]*id="${id}"[\\s\\S]*aria-describedby="quick-schedule-help quick-schedule-status"`,
        ),
      );
    }

    expect(createBlockSource).toContain(
      '<div class="quick-schedule__control quick-schedule__control--date">',
    );
    expect(todaySource).toMatch(
      /@media \(max-width: 40rem\)[\s\S]*\.quick-schedule__control--date/,
    );

    const selectorIndex = todaySource.indexOf('data-quick-schedule-selector');
    const binderCallIndex = todaySource.indexOf('bindQuickScheduleSelectors(document)');

    expect(todaySource).toContain(
      "import { bindQuickScheduleSelectors } from '../../components/today/quick-schedule-selector';",
    );
    expect(binderCallIndex).toBeGreaterThan(selectorIndex);
    expect(todaySource).toContain("document.readyState === 'loading'");
    expect(todaySource).toContain(
      "document.addEventListener('DOMContentLoaded', bindQuickSchedule",
    );
    expect(todaySource).toContain('{ once: true }');
  });
});
