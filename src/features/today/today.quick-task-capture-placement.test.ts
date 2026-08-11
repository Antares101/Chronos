import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readTodaySource() {
  return readFileSync(new URL('../../pages/today.astro', import.meta.url), 'utf8');
}

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

      expect(source).toContain(
        "import { resolveTodayLocalFeedback } from '../features/today/today-feedback-scoping';",
      );
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
      "import { bindTodayAssignmentInteractions } from '../features/today/today-assignment-interactions';",
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
    expect(source).toContain("import TodayQuickBlock from '../components/today/TodayQuickBlock';");
    expect(source).toContain('<TodayQuickBlock {...quickBlockProps} />');
    expect(source).toContain('bindQuickScheduleSelectors(document)');
    expect(source).toContain('grid-template-columns: minmax(19rem, 23rem) minmax(0, 1fr);');
    expect(source).toContain(
      "grid-template-areas: 'capture shelf' 'quick-block sheet' 'intention sheet' 'closeout sheet';",
    );
    expect(source).toMatch(/\.today-workspace__closeout\s*\{\s*grid-area: closeout;/);
    expect(source).toContain(
      "grid-template-areas: 'capture' 'shelf' 'quick-block' 'sheet' 'intention' 'closeout';",
    );
  });

  it('bounds the route on wide screens without changing mobile DOM or grid-area order', () => {
    const source = readTodaySource();

    expect(source).toContain('width: min(100%, var(--app-route-max));');
    expect(source).toContain('margin-inline: auto;');
    expect(source).not.toContain('eyebrow="CHRONOS"');
    expect(source).not.toContain('summary="Set today’s intention');
    expect(source).toContain('heading="Run the Day"');
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
