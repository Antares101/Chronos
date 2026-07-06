import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readReviewSource() {
  return readFileSync(new URL('./review.astro', import.meta.url), 'utf8');
}

describe('Review daily review route contract', () => {
  it('renders DailyReviewCards from route state without hydrating the review card component', () => {
    const source = readReviewSource();

    expect(source).toContain(
      "import DailyReviewCards from '../../components/review/DailyReviewCards';",
    );
    expect(source).toContain('<DailyReviewCards');

    const cardsIndex = source.indexOf('<DailyReviewCards');
    const cardsEndIndex = source.indexOf('/>', cardsIndex);
    const cardsSource = source.slice(cardsIndex, cardsEndIndex);

    expect(cardsIndex).toBeGreaterThanOrEqual(0);
    expect(cardsEndIndex).toBeGreaterThan(cardsIndex);
    expect(cardsSource).not.toContain('client:');
    expect(cardsSource).toContain('blocks={appState.executionBlocks.map((block) => ({');
    expect(cardsSource).toContain('id: block.id');
    expect(cardsSource).toContain('title: block.title');
    expect(cardsSource).toContain(
      'tasks: (appState.tasksByBlockId[block.id] ?? []).map((task) => ({',
    );
    expect(cardsSource).toContain('id: task.id');
    expect(cardsSource).toContain('title: task.title');
    expect(cardsSource).toContain('status: task.status');
  });

  it('frames the page as a block closeout instead of a whole-day digest', () => {
    const source = readReviewSource();

    expect(source).toContain('heading="Close a block"');
    expect(source).toContain(
      'summary="Review one active block at a time, mark what finished, and note the adjustment for tomorrow."',
    );
    expect(source).toContain('<p class="eyebrow">Daily Review</p>');
    expect(source).not.toContain('heading="Close the day"');
  });

  it('preserves the conclusion output path and removes the route-local conclude-block form', () => {
    const source = readReviewSource();

    expect(source).toContain('<ConclusionPanel {...appState.conclusionPanel} client:load />');
    expect(source).not.toContain('<form method="post" class="conclusion-form">');
    expect(source).not.toContain('name="action" value="conclude-block"');
    expect(source).not.toContain('name="openItems"');
    expect(source).not.toContain('name="remainingTaskIds"');
  });
});
