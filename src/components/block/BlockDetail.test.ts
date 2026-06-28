import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import BlockDetail, { type BlockDetailProps } from './BlockDetail';

const blockDetailProps = {
  eyebrow: 'Current focus',
  title: 'Block detail',
  description: 'Focused block context and attached artifacts.',
  block: {
    id: 'active-block',
    title: 'Build API surface',
    category: 'work',
    phase: 'execution',
    plannedStart: '2026-06-29T09:00:00.000Z',
    plannedEnd: '2026-06-29T10:30:00.000Z',
  },
  tasks: [
    {
      id: 'block-done',
      title: 'Ship test scaffolding',
      status: 'done',
    },
    {
      id: 'block-todo',
      title: 'Ship component',
      status: 'todo',
    },
  ],
  highlightedEvents: [
    {
      id: 'event-a',
      title: 'Release block',
      note: 'Keep this near top.',
    },
  ],
  pauses: [
    {
      id: 'pause-a',
      kind: '5m',
      startedAt: '2026-06-29T09:10:00.000Z',
      endedAt: '2026-06-29T09:15:00.000Z',
      note: 'Focus dip',
    },
    {
      id: 'pause-b',
      kind: 'untimed',
      startedAt: '2026-06-29T09:20:00.000Z',
      endedAt: null,
    },
  ],
} satisfies BlockDetailProps;

function renderBlockDetail(props: Partial<BlockDetailProps> = {}): string {
  return renderToStaticMarkup(createElement(BlockDetail, { ...blockDetailProps, ...props }));
}

function countMatches(value: string, expression: RegExp): number {
  return value.match(expression)?.length ?? 0;
}

describe('BlockDetail', () => {
  it('renders block context with category, phase, time range and duration', () => {
    const html = renderBlockDetail();

    expect(html).toContain('Build API surface');
    expect(html).toContain('Work · execution · 09:00 to 10:30 · 1h 30m');
    expect(html).toContain('id="block-detail-tasks-title">Block tasks');
  });

  it('lists block tasks and highlights open event history with sort order todo-first', () => {
    const html = renderBlockDetail();

    const firstTaskIndex = html.indexOf('Ship component');
    const secondTaskIndex = html.indexOf('Ship test scaffolding');

    expect(firstTaskIndex).toBeGreaterThanOrEqual(0);
    expect(secondTaskIndex).toBeGreaterThan(firstTaskIndex);
    expect(html).toContain('★ Release block');
    expect(html).toContain('Keep this near top.');
    expect(html).toContain('aria-label="Highlighted event: Release block"');
    expect(html).toContain('aria-label="5m pause at 2026-06-29T09:10:00.000Z"');
  });

  it('shows empty states when no block tasks or events are provided', () => {
    const html = renderBlockDetail({ tasks: [], highlightedEvents: [] });

    expect(html).toContain('No tasks are attached to this block yet.');
    expect(html).toContain('No highlighted events attached.');
    expect(countMatches(html, /No highlighted events attached/g)).toBe(1);
  });
});
