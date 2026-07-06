import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayActionsGrid, { type TodayActionsGridProps } from './TodayActionsGrid';

const planningBlocks = [
  { id: 'plan-1', title: 'Morning focus' },
  { id: 'plan-2', title: 'Admin window' },
] satisfies TodayActionsGridProps['planningBlocks'];

const blocks = [
  { id: 'block-1', title: 'Deep work', phase: 'execution' },
  { id: 'block-2', title: 'Follow up', phase: 'review' },
] satisfies TodayActionsGridProps['blocks'];

const quickBlockDefaults = {
  date: '2026-07-06',
  startTime: '09:00',
  endTime: '10:00',
} satisfies TodayActionsGridProps['quickBlockDefaults'];

const quickBlockPreview = {
  windowLabel: 'Today, 09:00–10:00',
  durationLabel: '1h',
  statusLabel: 'Ready.',
} satisfies TodayActionsGridProps['quickBlockPreview'];

function renderTodayActionsGrid(overrides: Partial<TodayActionsGridProps> = {}) {
  return renderToStaticMarkup(
    createElement(TodayActionsGrid, {
      planningBlocks,
      blocks,
      todayDate: '2026-07-06',
      quickBlockDefaults,
      quickBlockPreview,
      ...overrides,
    }),
  );
}

describe('TodayActionsGrid', () => {
  it('renders only the remaining externally visible Today action cards', () => {
    const html = renderTodayActionsGrid();

    expect(html).toContain('Start planned block');
    expect(html).toContain('Create block here');
    expect(html).toContain('Add highlighted event');
    expect(html).not.toContain('Create task inside block');
    expect(html).not.toContain('name="action" value="create-task"');
  });

  it('preserves the non-task same-route action contracts', () => {
    const html = renderTodayActionsGrid();

    expect(html).toMatch(
      /<form(?=[^>]*method="post")[^>]*>[\s\S]*name="action" value="start-block"/,
    );
    expect(html).toMatch(
      /<select(?=[^>]*name="blockId")(?=[^>]*required)[\s\S]*<option value="plan-1">Morning focus<\/option>/,
    );
    expect(html).toMatch(
      /<form(?=[^>]*method="post")[^>]*>[\s\S]*name="action" value="create-planned-block"/,
    );
    expect(html).toMatch(
      /<input(?=[^>]*name="title")(?=[^>]*required)(?=[^>]*maxLength="120")[^>]*placeholder="Focused work"/,
    );
    expect(html).toMatch(
      /<form(?=[^>]*method="post")[^>]*>[\s\S]*name="action" value="create-highlighted-event"/,
    );
    expect(html).toMatch(/<option value="block-1">Deep work · execution<\/option>/);
    expect(html).toMatch(
      /<input(?=[^>]*name="title")(?=[^>]*required)(?=[^>]*maxLength="120")[^>]*placeholder="Important handoff"/,
    );
  });

  it('keeps no-block guidance and disabled controls for start and highlighted event actions', () => {
    const html = renderTodayActionsGrid({ planningBlocks: [], blocks: [] });

    expect(html).toContain('No planned blocks ready to start.');
    expect(html).toMatch(
      /<select(?=[^>]*name="blockId")(?=[^>]*disabled="")(?=[^>]*aria-describedby="start-block-helper")[^>]*>/,
    );
    expect(html).toContain(
      '<button type="submit" disabled="" aria-describedby="start-block-helper">Start block</button>',
    );
    expect(html).toContain('Create or start a block first');
    expect(html).toContain('Create or start a block before adding tasks or events.');
    expect(html).toMatch(
      /<input(?=[^>]*name="title")(?=[^>]*disabled="")(?=[^>]*aria-describedby="highlighted-event-helper")[^>]*placeholder="Important handoff"/,
    );
    expect(html).toContain(
      '<button type="submit" disabled="" aria-describedby="highlighted-event-helper">Add highlighted event</button>',
    );
  });

  it('renders the quick schedule preview contract used by the selector', () => {
    const html = renderTodayActionsGrid();

    expect(html).toContain('data-quick-schedule-selector="true"');
    expect(html).toContain('data-today-date="2026-07-06"');
    expect(html).toContain('for="quick-block-date quick-block-start quick-block-end"');
    expect(html).toContain('data-quick-schedule-window="true"');
    expect(html).toContain('Today, 09:00–10:00');
    expect(html).toContain('data-quick-schedule-duration="true"');
    expect(html).toContain('1h');
    expect(html).toMatch(
      /<input(?=[^>]*id="quick-block-date")(?=[^>]*data-quick-schedule-date="true")(?=[^>]*name="date")(?=[^>]*type="date")(?=[^>]*value="2026-07-06")/,
    );
    expect(html).toMatch(
      /<input(?=[^>]*id="quick-block-start")(?=[^>]*data-quick-schedule-start="true")(?=[^>]*name="startTime")(?=[^>]*type="time")(?=[^>]*value="09:00")/,
    );
    expect(html).toMatch(
      /<input(?=[^>]*id="quick-block-end")(?=[^>]*data-quick-schedule-end="true")(?=[^>]*name="endTime")(?=[^>]*type="time")(?=[^>]*value="10:00")/,
    );
    expect(html).toContain('data-duration-minutes="30"');
    expect(html).toContain('data-duration-minutes="120"');
    expect(html).toContain('data-quick-schedule-status="true"');
    expect(html).toContain('Ready.');
  });
});
