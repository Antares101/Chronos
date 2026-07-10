import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readPlanningSource() {
  return readFileSync(new URL('./planning.astro', import.meta.url), 'utf8');
}

describe('Planning compact workbench', () => {
  it('renders the weekly calendar and unassigned tasks before the action rail', () => {
    const source = readPlanningSource();

    const mainIndex = source.indexOf('<main class="planning-workbench__main">');
    const calendarIndex = source.indexOf('<WeeklyCalendar');
    const taskListIndex = source.indexOf('<TaskList');
    const railIndex = source.indexOf('class="planning-workbench__rail actions"');

    expect(mainIndex).toBeGreaterThanOrEqual(0);
    expect(calendarIndex).toBeGreaterThan(mainIndex);
    expect(taskListIndex).toBeGreaterThan(calendarIndex);
    expect(railIndex).toBeGreaterThan(taskListIndex);
    expect(source.slice(calendarIndex, source.indexOf('/>', calendarIndex))).toContain(
      'client:load',
    );
    expect(source.slice(taskListIndex, source.indexOf('/>', taskListIndex))).toContain(
      'client:load',
    );
  });

  it('keeps create block expanded and places secondary actions in native details', () => {
    const source = readPlanningSource();

    expect(source).toContain('<article class="action-card planning-workbench__create">');
    expect(source).toContain('<h3>Create planned block</h3>');
    expect(source).toContain('<details class="planning-action">');
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

  it('uses a bounded desktop rail without a four-column action wall', () => {
    const source = readPlanningSource();

    expect(source).toContain('@media (min-width: 88rem)');
    expect(source).toContain('grid-template-columns: minmax(0, 1fr) minmax(24rem, 28rem);');
    expect(source).toContain('.planning-workbench__main,');
    expect(source).toContain('.planning-workbench__rail {');
    expect(source).toContain('min-width: 0;');
    expect(source).not.toContain('repeat(4, minmax(0, 1fr))');
  });
});
