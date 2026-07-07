import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ConclusionPanel, {
  type ConclusionPanelProps,
  type ConclusionPanelTask,
} from './ConclusionPanel';

const completedTasks: readonly ConclusionPanelTask[] = [
  { id: 'task-b', title: 'Book focus room' },
  { id: 'task-a', title: 'Answer user feedback' },
];

const conclusionPanelProps = {
  eyebrow: 'Conclusion',
  title: 'Execution review',
  description: 'Capture outcome and next action.',
  block: {
    id: 'deep-work',
    title: 'Deep work',
    category: 'work' as const,
  },
  completedTaskIds: ['task-a', 'task-b'],
  completedTasks,
  plannedMinutes: 180,
  actualMinutes: 195,
  notes: 'I kept momentum during the first hour.',
  nextAdjustment: 'Split deep work into two sessions.',
} satisfies ConclusionPanelProps;

function renderConclusionPanel(props: Partial<ConclusionPanelProps> = {}): string {
  return renderToStaticMarkup(
    createElement(ConclusionPanel, { ...conclusionPanelProps, ...props }),
  );
}

describe('ConclusionPanel', () => {
  it('renders a block review summary with variance and task list', () => {
    const html = renderConclusionPanel();

    expect(html).toContain('Deep work');
    expect(html).toContain('Planned');
    expect(html).toContain('Actual');
    expect(html).toContain('+15m (over)');
    expect(html).toContain('Book focus room');
    expect(html).toContain('Answer user feedback');
    expect(html).toContain('I kept momentum during the first hour.');
    expect(html).toContain('Adjustment for tomorrow planning');
    expect(html).toContain('Split deep work into two sessions.');
    expect(html).toContain('Use Planning to decide what moves, waits, or changes next.');
  });

  it('shows empty-state text when no tasks were completed', () => {
    const html = renderConclusionPanel({
      completedTaskIds: [],
      completedTasks: [],
      notes: '',
      nextAdjustment: null,
    });

    expect(html).toContain('No tasks were marked complete.');
    expect(html).toContain('No notes were added for this block.');
    expect(html).toContain('No adjustment was added for tomorrow planning.');
  });

  it('uses the tomorrow planning fallback when the optional adjustment is blank', () => {
    expect(renderConclusionPanel({ nextAdjustment: '' })).toContain(
      'No adjustment was added for tomorrow planning.',
    );
    expect(renderConclusionPanel({ nextAdjustment: '   ' })).toContain(
      'No adjustment was added for tomorrow planning.',
    );
  });
});
