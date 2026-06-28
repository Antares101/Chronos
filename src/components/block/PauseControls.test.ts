import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import PauseControls, { type PauseControlsProps } from './PauseControls';

const pauseControlsProps = {
  eyebrow: 'Active block interruptions',
  title: 'Pause controls',
  description: 'Capture pauses without adjusting planned windows.',
  blockPhase: 'execution',
  pauses: [
    {
      id: 'pause-1',
      kind: '10m',
      startedAt: '2026-06-29T09:15:00.000Z',
      endedAt: '2026-06-29T09:25:00.000Z',
      note: 'Focus dip',
    },
    {
      id: 'pause-2',
      kind: '5m',
      startedAt: '2026-06-29T10:10:00.000Z',
      endedAt: '2026-06-29T10:14:00.000Z',
      note: null,
    },
  ],
} satisfies PauseControlsProps;

function renderPauseControls(props: Partial<PauseControlsProps> = {}): string {
  return renderToStaticMarkup(createElement(PauseControls, { ...pauseControlsProps, ...props }));
}

function countMatches(value: string, expression: RegExp): number {
  return value.match(expression)?.length ?? 0;
}

describe('PauseControls', () => {
  it('renders action buttons in enabled state during execution', () => {
    const html = renderPauseControls();

    expect(html).toContain('Execution active');
    expect(html).toContain('Pause logging is available while the block is in execution.');
    expect(html).toContain('aria-label="Log 5-minute pause"');
    expect(html).toContain('aria-label="Log 10-minute pause"');
    expect(html).toContain('aria-label="Start untimed pause"');
    expect(/<button[^>]+disabled=/.test(html)).toBe(false);
  });

  it('logs durations from closed pauses', () => {
    const html = renderPauseControls();

    expect(countMatches(html, /aria-label="10m pause at/g)).toBe(1);
    expect(html).toContain('10M • Focus dip');
    expect(html).toContain('10M');
    expect(html).toContain('4m');
  });

  it('renders a backend action for ending an open untimed pause', () => {
    const html = renderPauseControls({
      actionPath: '/app',
      blockId: 'block-1',
      pauses: [
        {
          id: 'pause-open',
          kind: 'untimed',
          startedAt: '2026-06-29T09:35:00.000Z',
          endedAt: null,
          note: 'Doorbell',
        },
      ],
    });

    expect(html).toContain('value="end-pause"');
    expect(html).toContain('name="pauseId" value="pause-open"');
    expect(html).toContain('aria-label="End untimed pause started at 2026-06-29T09:35:00.000Z"');
    expect(html).toContain('End pause');
  });

  it('renders disabled controls and open-state text when block not in execution', () => {
    const html = renderPauseControls({ blockPhase: 'planning' });

    expect(html).toContain('Execution not active');
    expect(countMatches(html, /disabled=""/g)).toBe(3);
    expect(html).toContain('Pause logging is only available while block phase is execution.');
    expect(html).toContain('aria-label="Start untimed pause"');
  });
});
