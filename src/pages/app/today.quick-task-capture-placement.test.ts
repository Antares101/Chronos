import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readTodaySource() {
  return readFileSync(new URL('./today.astro', import.meta.url), 'utf8');
}

describe('Today quick task capture placement', () => {
  it('renders QuickTaskCapture after the actions header and before the Today actions grid component', () => {
    const source = readTodaySource();

    expect(source).toContain(
      "import QuickTaskCapture from '../../components/today/QuickTaskCapture';",
    );
    expect(source).toContain(
      "import TodayActionsGrid from '../../components/today/TodayActionsGrid';",
    );

    const headerIndex = source.indexOf('<div class="actions__header">');
    const captureIndex = source.indexOf('<QuickTaskCapture');
    const gridIndex = source.indexOf('<TodayActionsGrid');

    expect(headerIndex).toBeGreaterThanOrEqual(0);
    expect(captureIndex).toBeGreaterThan(headerIndex);
    expect(gridIndex).toBeGreaterThan(captureIndex);

    const captureEndIndex = source.indexOf('/>', captureIndex);
    const captureSource = source.slice(captureIndex, captureEndIndex);
    const gridEndIndex = source.indexOf('/>', gridIndex);
    const gridSource = source.slice(gridIndex, gridEndIndex);

    expect(captureEndIndex).toBeLessThan(gridIndex);
    expect(captureSource).not.toContain('client:');
    expect(gridSource).not.toContain('client:');
  });

  it('passes Today route data to QuickTaskCapture and TodayActionsGrid without restoring inline task creation', () => {
    const source = readTodaySource();

    expect(source).toContain(
      'blocks={appState.blocks.map(({ id, title, phase }) => ({ id, title, phase }))}',
    );
    expect(source).toContain('currentBlockId={appState.todayTaskPanel.currentBlockId}');
    expect(source).toContain('currentBlockTitle={appState.todayTaskPanel.currentBlockTitle}');
    expect(source).toContain('planningBlocks={appState.planningBlocks}');
    expect(source).toContain('todayDate={appState.todayDate}');
    expect(source).toContain('quickBlockDefaults={appState.quickBlockDefaults}');
    expect(source).toContain('quickBlockPreview={quickBlockPreview}');
    expect(source).not.toContain('Create task inside block');
    expect(source).not.toContain('value="create-task"');
  });

  it('keeps the compact shell identity and timeline context ahead of the bounded action rail', () => {
    const source = readTodaySource();

    expect(source).toContain('eyebrow="CHRONOS"');

    const timelineIndex = source.indexOf('<div class="today-workspace__timeline">');
    const utilityIndex = source.indexOf('<aside class="today-workspace__utility"');
    const taskPanelIndex = source.indexOf('<TodayTaskPanel');
    const goalsPanelIndex = source.indexOf('<TodayGoalsPanel');

    expect(timelineIndex).toBeGreaterThanOrEqual(0);
    expect(utilityIndex).toBeGreaterThan(timelineIndex);
    expect(taskPanelIndex).toBeGreaterThan(utilityIndex);
    expect(goalsPanelIndex).toBeGreaterThan(taskPanelIndex);
    expect(source).toContain('.today-workspace__utility :global(.quick-task-capture__form)');
    expect(source).toContain('bindQuickScheduleSelectors(document)');
  });

  it('gives selected-block task titles a full row before status and actions on desktop', () => {
    const source = readTodaySource();

    expect(source).toContain('.today-workspace__timeline :global(.block-detail__task) {');
    expect(source).toContain('grid-template-columns: minmax(0, 1fr) auto;');
    expect(source).toContain(
      '.today-workspace__timeline :global(.block-detail__task > span:first-child) {',
    );
    expect(source).toContain('grid-column: 1 / -1;');
    expect(source).toContain('overflow-wrap: break-word;');
  });

  it('does not force a fixed four-column Today actions grid', () => {
    const source = readTodaySource();

    expect(source).not.toContain('repeat(4, minmax(0, 1fr))');
  });
});
