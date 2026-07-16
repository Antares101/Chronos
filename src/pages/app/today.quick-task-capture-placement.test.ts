import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readTodaySource() {
  return readFileSync(new URL('./today.astro', import.meta.url), 'utf8');
}

describe.skip('Legacy Today composition retained for rollback', () => {
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

describe('Today daily workspace route composition', () => {
  // prettier-ignore
  it('keeps auth and composes ordered workspace landmarks', () => { const source = readTodaySource(); expect(source).toContain('resolveChronosActionRouteContext({'); expect(source).toContain('composeTodayBlockPauses('); expect(source).toContain("row.block.phase === 'execution'"); expect(source).toMatch(/row\.block\.phase === 'execution' \? \[[^\n]+\] : \[\];/); const names = ['<TodayActiveBlock', '<TodayQuickTaskCapture', '<TodayTaskInbox', '<TodayQuickBlock', '<TodayDaySheet', '<TodayDailyHeader', '<TodayCloseout']; const positions = names.map((name) => source.indexOf(name)); expect(positions.every((position) => position >= 0)).toBe(true); expect(positions).toEqual([...positions].sort((a, b) => a - b)); });
  // prettier-ignore
  it('uses exactly one island without the dense dashboard', () => { const source = readTodaySource(); expect(source.match(/client:load/g)).toHaveLength(1); expect(source).toMatch(/<TodayQuickTaskCapture[\s\S]*client:load/); expect(source).not.toMatch(/<TodayOperatingSummary|<DailyTimeline|<BlockDetail|<TodayActionsGrid|analytics|sidebar/i); });
  // prettier-ignore
  it('covers responsive containment, distinct safe-area padding, and focus return', () => { const source = readTodaySource(); for (const token of ['box-sizing: border-box', 'min-width: 0', 'max-width: 100%', 'flex-wrap: wrap', 'min-height: 44px', '@media (max-width: 72rem)', '@media (max-width: 48rem)', '@media (prefers-reduced-motion: reduce)', 'sessionStorage', 'data-focus-target', 'persistTodayFocusTargetForSubmit(event, storage, focusKey, target.id)', 'restoreTodayFocus(storage, focusKey, document)']) expect(source).toContain(token); expect(source).not.toContain('{ capture: true }'); expect(source).toContain('padding-inline-start: max(0.25rem, env(safe-area-inset-left));'); expect(source).toContain('padding-inline-end: max(0.25rem, env(safe-area-inset-right));'); });
  // prettier-ignore
  it('delegates local feedback scoping while preserving unknown feedback for the shell', () => {
      const source = readTodaySource();

      expect(source).toContain("import { resolveTodayLocalFeedback } from './today-feedback-scoping';");
      expect(source).toContain('const localFeedback = resolveTodayLocalFeedback(');
      for (const action of [
        'today-save-daily-header',
        'today-create-task',
        'today-save-goals',
        'today-save-closeout',
      ]) {
        expect(source).toContain(`localFeedback.actionError?.action === '${action}'`);
        expect(source).toContain(`localFeedback.statusMessage?.action === '${action}'`);
      }
      expect(source).toContain(`const shellActionError = localFeedback.actionError ? null : actionError;`);
      expect(source).toContain(
        'const shellStatusMessage = localFeedback.statusMessage ? null : statusMessage;',
      );
    });

  it('passes Day Sheet-scoped task confirmation to its local status region', () => {
    const source = readTodaySource();

    expect(source).toContain('feedbackOrigin');
    expect(source).toContain('highlightedEventsByBlockId');
    expect(source).not.toContain('today-block-action-draft');
    expect(source).not.toContain('today-block-action-recovery');
    expect(source).not.toContain('blockActionDraft');
    expect(source).toContain('const localFeedback = resolveTodayLocalFeedback(');
    expect(source).toContain(
      "localFeedback.statusMessage?.action === 'create-task' ? localFeedback.statusMessage.message : null",
    );
  });

  it('binds pointer assignment as a route-local enhancement without a client mutation path', () => {
    const source = readTodaySource();

    expect(source).toContain(
      "import { bindTodayAssignmentInteractions } from './today-assignment-interactions';",
    );
    expect(source).toContain('bindTodayAssignmentInteractions(document)');
    expect(source).not.toContain('fetch(');
  });

  it('keeps the native task inbox ahead of day-sheet context in the current achievable route order', () => {
    const source = readTodaySource();

    const captureIndex = source.indexOf('<TodayQuickTaskCapture');
    const inboxIndex = source.indexOf('<TodayTaskInbox');
    const sheetIndex = source.indexOf('<TodayDaySheet');
    expect(captureIndex).toBeGreaterThanOrEqual(0);
    expect(inboxIndex).toBeGreaterThan(captureIndex);
    expect(sheetIndex).toBeGreaterThan(inboxIndex);
    expect(source).toContain('targets: appState.workspace.sheet.assignmentTargets');
    expect(source).toContain("localFeedback.actionError?.action === 'assign-task'");
    expect(source).toContain("localFeedback.statusMessage?.action === 'assign-task'");
    expect(source).toContain('closeTodayDisclosure');
    expect(source).toContain(
      "import TodayQuickBlock from '../../components/today/TodayQuickBlock';",
    );
    expect(source).toContain('<TodayQuickBlock {...quickBlockProps} />');
    expect(source).toContain('bindQuickScheduleSelectors(document)');
    expect(source).toContain(
      'grid-template-columns: minmax(min(100%, 20rem), 1fr) minmax(0, 2fr);',
    );
    expect(source).toContain(
      "grid-template-areas: 'capture shelf' 'quick-block sheet' 'intention sheet' 'closeout sheet';",
    );
    expect(source).toMatch(/\.today-workspace__closeout\s*\{\s*grid-area: closeout;/);
    expect(source).toContain(
      "grid-template-areas: 'capture' 'shelf' 'quick-block' 'sheet' 'intention' 'closeout';",
    );
  });
});

describe('Today active cockpit composition', () => {
  it('renders current route surfaces in active-first DOM order', () => {
    const source = readTodaySource();
    const positions = [
      '<TodayActiveBlock',
      '<TodayQuickTaskCapture',
      '<TodayTaskInbox',
      '<TodayQuickBlock',
      '<TodayDaySheet',
      '<TodayDailyHeader',
      '<TodayCloseout',
    ].map((surface) => source.indexOf(surface));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });
});
