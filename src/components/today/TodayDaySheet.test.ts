import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Block } from '../../domain/models';
import type { DaySheetRow } from '../../domain/services/today-workspace';
import type { DailyTimelinePause } from '../timeline/DailyTimeline';
import TodayDaySheet, { type TodayDaySheetProps } from './TodayDaySheet';

// prettier-ignore
const block = (overrides: Partial<Block> = {}): Block => ({ id: 'block-1', userId: 'user-1', category: 'work', title: 'Deep work with a very long title that must remain readable', plannedStart: '2026-07-11T09:00:00.000Z', plannedEnd: '2026-07-11T10:00:00.000Z', phase: 'execution', createdAt: '2026-07-11T08:00:00.000Z', updatedAt: '2026-07-11T08:00:00.000Z', ...overrides });
// prettier-ignore
const pause: DailyTimelinePause = { id: 'pause-1', blockId: 'block-1', kind: 'untimed', startedAt: '2026-07-11T09:30:00.000Z', endedAt: null, note: 'Coffee' };
// prettier-ignore
const row = (overrides: Partial<Extract<DaySheetRow, { kind: 'block' }>> = {}) => ({ kind: 'block' as const, block: block(), clippedStart: '2026-07-11T09:00:00.000Z', clippedEnd: '2026-07-11T10:00:00.000Z', edge: 'inside' as const, overlapDepth: 0, lifecycle: 'active' as const, ...overrides });
// prettier-ignore
const defaults: TodayDaySheetProps = { rows: [{ kind: 'gap', start: '2026-07-11T00:00:00.000Z', end: '2026-07-11T09:00:00.000Z' }, row()], currentTime: '2026-07-11T09:15:00.000Z', actionPath: '/app/today', blockDetails: { 'block-1': { tasks: [{ id: 'task-1', title: 'Draft proposal', status: 'done' }], highlightedEvents: [{ id: 'event-1', title: 'Resolved blocker' }], pauses: [pause], permittedActions: [{ kind: 'pause' }, { kind: 'resume', pauseId: 'pause-1' }, { kind: 'event' }, { kind: 'task' }, { kind: 'conclusion', tasks: [{ id: 'task-1', title: 'Draft proposal', status: 'done' }, { id: 'task-2', title: 'Share proposal', status: 'todo' }] }] } } };
const render = (props: Partial<TodayDaySheetProps> = {}) =>
  renderToStaticMarkup(createElement(TodayDaySheet, { ...defaults, ...props }));
const expectText = (html: string, values: string[]) =>
  values.forEach((value) => expect(html).toContain(value));
const expectContract = (html: string, action: string, fields: string[]) => {
  const form =
    html.match(
      new RegExp(`<form[^>]*>[\\s\\S]*?name="action" value="${action}"[\\s\\S]*?</form>`),
    )?.[0] ?? '';
  expect(form).not.toBe('');
  fields.forEach((field) => expect(form).toContain(`name="${field}"`));
};

describe('TodayDaySheet', () => {
  it('renders chronological ordered-list and current-time semantics with readable states', () => {
    const html = render();
    expectText(html, [
      '<ol',
      '<time dateTime="2026-07-11T09:00:00.000Z">09:00</time>',
      'aria-current="time"',
      'Now · 09:15',
      'Active',
      'Open time',
      'Draft proposal',
      'Paused · Untimed · Open · Coffee',
    ]);
  });

  it('exposes each authoritative block row as a pointer assignment target', () => {
    const html = render();

    expect(html).toContain('data-assignment-target="block-1"');
    expect(html).toContain(
      'data-assignment-target-label="Deep work with a very long title that must remain readable"',
    );
  });

  it('renders scheduled task status controls and highlighted events for each block', () => {
    const html = render();
    const taskForm =
      html.match(
        /<form[^>]*>[\s\S]*?name="action" value="today-set-task-status"[\s\S]*?<\/form>/,
      )?.[0] ?? '';

    expect(taskForm).toContain('name="taskId" value="task-1"');
    expect(taskForm).toContain('name="status" value="todo"');
    expect(taskForm).toContain('aria-label="Mark Draft proposal to do"');
    expect(html).toContain(
      'Highlighted events for Deep work with a very long title that must remain readable',
    );
    expect(html).toContain('Resolved blocker');
  });

  it('separates open-time chronology and labels a full-day gap as 24:00', () => {
    const html = render({
      rows: [
        {
          kind: 'gap',
          start: '2026-07-11T00:00:00.000Z',
          end: '2026-07-12T00:00:00.000Z',
        },
      ],
      currentTime: '2026-07-11T17:23:00.000Z',
      blockDetails: {},
    });

    expect(html.replace(/<[^>]*>/g, '')).toContain('00:00 · Now · 17:23 · 24:00');
  });

  it('preserves 00:00 for an open gap that ends at midnight but is not a full day', () => {
    const html = render({
      rows: [
        {
          kind: 'gap',
          start: '2026-07-11T23:00:00.000Z',
          end: '2026-07-12T00:00:00.000Z',
        },
      ],
      currentTime: null,
      blockDetails: {},
    });

    expect(html.replace(/<[^>]*>/g, '')).toContain('23:00 · 00:00');
  });

  it('places the current marker inside its containing block interval', () => {
    const html = render();
    const start = html.indexOf('>09:00</time>');
    const current = html.indexOf('Now · 09:15');
    expect(start).toBeLessThan(current);
    expect(current).toBeLessThan(html.indexOf('>10:00</time>'));
  });

  it('gives conclusion task checkboxes a 44px label hit target without enlarging the checkbox', () => {
    const html = render();

    expect(html).toContain(
      '.today-block fieldset label{display:flex;align-items:center;min-height:44px;padding:.25rem 0}',
    );
    expect(html).toContain('.today-block fieldset input{width:auto;min-height:auto}');
  });

  it('restores exact title browser-validation contracts per action', () => {
    const html = render();
    const eventForm = html.split('value="create-highlighted-event"')[1].split('</form>')[0];
    const taskForm = html.split('value="create-task"')[1].split('</form>')[0];
    expectText(eventForm, ['name="title"', 'maxLength="120"']);
    expect(eventForm).not.toContain('pattern=');
    expectText(taskForm, ['name="title"', 'maxLength="120"', 'pattern=".*\\S.*"']);
  });

  it('renders an unavailable detail state without fabricated empty data or actions', () => {
    const html = render({ blockDetails: {} });
    expectText(html, ['Block details are unavailable.']);
    expect(html).not.toContain('No tasks in this block.');
    expect(html).not.toContain('No actions currently available.');
  });

  it('preserves permitted legacy contracts behind visible keyboard-operable controls', () => {
    const html = render();
    expectText(html, [
      '<details',
      '<summary>Actions for Deep work with a very long title that must remain readable</summary>',
      'aria-label="Record a highlighted event for Deep work',
    ]);
    expect(html).not.toContain('onMouseEnter');
    expectContract(html, 'log-pause', ['blockId', 'pauseKind', 'note']);
    expectContract(html, 'end-pause', ['blockId', 'pauseId']);
    expectContract(html, 'create-highlighted-event', ['blockId', 'title']);
    expectContract(html, 'create-task', ['blockId', 'title']);
    expectContract(html, 'conclude-block', [
      'blockId',
      'completedTaskIds',
      'notes',
      'nextAdjustment',
    ]);
    expect(html).toMatch(
      /<input(?=[^>]*name="completedTaskIds")(?=[^>]*value="task-1")(?=[^>]*checked="")[^>]*>/,
    );
    expect(html).toMatch(
      /<input(?=[^>]*name="completedTaskIds")(?=[^>]*value="task-2")(?![^>]*checked="")[^>]*>/,
    );
    expect(html).toContain('<textarea name="notes" required=""></textarea>');
  });

  it('renders only explicitly permitted action variants', () => {
    const html = render({
      rows: [row({ block: block({ phase: 'planning' }), lifecycle: 'planned' })],
      currentTime: null,
      blockDetails: { 'block-1': { tasks: [], pauses: [], permittedActions: [{ kind: 'start' }] } },
    });
    expectContract(html, 'start-block', ['blockId']);
    expect(html).not.toContain('value="log-pause"');
    expect(html).not.toContain('aria-current="time"');
  });

  it('triangulates carry, overlap, paused, concluded, and no-action labels', () => {
    const rows = [
      row({ edge: 'carry-in', lifecycle: 'paused' }),
      row({
        block: block({ id: 'block-2', title: 'Overlap', phase: 'conclusion' }),
        edge: 'carry-out',
        overlapDepth: 1,
        lifecycle: 'concluded',
      }),
    ];
    const html = render({
      rows,
      currentTime: null,
      blockDetails: {
        'block-1': { tasks: [], pauses: [pause], permittedActions: [] },
        'block-2': { tasks: [], pauses: [], permittedActions: [] },
      },
    });
    expectText(html, [
      'Carry-in',
      'Carries into tomorrow',
      'Overlaps another block',
      'Paused',
      'Concluded',
    ]);
    expect(html.match(/No actions currently available/g)).toHaveLength(2);
  });

  it('shows an available-day state without fabricating a block', () => {
    const html = render({
      rows: [{ kind: 'gap', start: '2026-07-11T00:00:00.000Z', end: '2026-07-12T00:00:00.000Z' }],
      currentTime: null,
      blockDetails: {},
    });
    expectText(html, [
      'No planned blocks',
      'The day is available from 00:00 to 24:00.',
      'href="/app/planning"',
    ]);
    expect(html).not.toContain('<article');
  });

  it('renders one local polite task confirmation near the Day Sheet actions', () => {
    const html = render({ statusMessage: 'Task added to Deep work.' });

    expect(html).toContain('class="today-sheet__status"');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Task added to Deep work.');
  });
});
