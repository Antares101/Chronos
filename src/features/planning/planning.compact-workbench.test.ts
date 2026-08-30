import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readPlanningSource() {
  return readFileSync(new URL('../../pages/planning.astro', import.meta.url), 'utf8');
}

describe('Planning command ribbon', () => {
  it('places the planning horizon and connected actions before the calendar and backlog workspace', () => {
    const source = readPlanningSource();
    const contextIndex = source.indexOf('<section class="planning-context-band"');
    const ribbonIndex = source.indexOf('<section class="planning-command-ribbon"');
    const calendarIndex = source.indexOf('<WeeklyCalendar');
    const taskListIndex = source.indexOf('<TaskList');

    expect(contextIndex).toBeGreaterThanOrEqual(0);
    expect(ribbonIndex).toBeGreaterThan(contextIndex);
    expect(calendarIndex).toBeGreaterThan(ribbonIndex);
    expect(taskListIndex).toBeGreaterThan(calendarIndex);
    expect(source).toContain('Planning horizon');
    expect(source).toContain('class="planning-command-ribbon__actions"');
    expect(source).toContain('border-inline-start: 1px solid var(--planning-border);');
    expect(source).toContain('@media (max-width: 64rem)');
    expect(source).toContain('border-top: 1px solid var(--planning-border);');
    expect(source.slice(calendarIndex, source.indexOf('/>', calendarIndex))).toContain(
      'client:load',
    );
    expect(source.slice(taskListIndex, source.indexOf('/>', taskListIndex))).toContain(
      'client:load',
    );
  });

  it('keeps create block expanded and places secondary actions in native details', () => {
    const source = readPlanningSource();

    expect(source).toContain(
      '<article class="planning-command-ribbon__section planning-workbench__create">',
    );
    expect(source).toContain('<h3>Create planned block</h3>');
    expect(source).toContain('<details class="planning-command-ribbon__section planning-action">');
    expect(source).toContain('<summary>Edit planned schedule</summary>');
    expect(source).toContain('<summary>Move task into block</summary>');
    expect(source).toContain('<summary>Create task inside block</summary>');
    expect(source).not.toMatch(/<summary>[^<]*<(button|a|input|select)/s);
  });

  it('preserves planning action and create-block field contracts', () => {
    const source = readPlanningSource();

    for (const action of [
      'create-planned-block',
      'update-planned-schedule',
      'assign-task',
      'create-task',
    ]) {
      expect(source).toContain(`name="action" value="${action}"`);
    }

    const createActionIndex = source.indexOf('name="action" value="create-planned-block"');
    const createFormEnd = source.indexOf('</form>', createActionIndex);
    const createForm = source.slice(createActionIndex, createFormEnd);

    for (const field of ['title', 'category', 'date', 'startTime', 'endTime']) {
      expect(createForm).toContain(`name="${field}"`);
    }

    expect(source).toContain('loadChronosPlanningState');
    expect(source).toContain('blockCategories.map');
    expect(source).toContain('categoryLabels[category]');
  });

  it('keeps calendar dominant and stacks the ribbon and workspace safely on mobile', () => {
    const source = readPlanningSource();

    expect(source).toContain('grid-template-columns: minmax(0, 1.45fr) minmax(19rem, 0.8fr);');
    expect(source).toContain('.planning-command-ribbon__actions,\n    .planning-workspace {');
    expect(source).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(source).toContain('min-width: 0;');
  });
});
