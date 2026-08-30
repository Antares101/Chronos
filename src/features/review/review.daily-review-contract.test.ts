import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readReviewSource() {
  return readFileSync(new URL('../../pages/review.astro', import.meta.url), 'utf8');
}

describe('Review command ribbon contract', () => {
  it('renders DailyReviewCards from route state without hydrating the review card component', () => {
    const source = readReviewSource();

    expect(source).toContain(
      "import DailyReviewCards from '../components/review/DailyReviewCards';",
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

  it('uses truthful execution block workload as the visible review context', () => {
    const source = readReviewSource();

    expect(source).toContain('const executionBlockCount = appState.executionBlocks.length;');
    expect(source).toContain('<section class="review-context-band"');
    expect(source).toContain('Current review workload');
    expect(source).toContain('execution blocks ready for review');
    expect(source).toContain('heading="Close a block"');
    expect(source).not.toContain('heading="Close the day"');
  });

  it('connects review cards in the command surface and leaves conclusion context alongside it on desktop', () => {
    const source = readReviewSource();
    const ribbonIndex = source.indexOf('<section class="review-command-ribbon"');
    const cardsIndex = source.indexOf('<DailyReviewCards');
    const historyIndex = source.indexOf('<aside class="review-history-panel"');
    const conclusionIndex = source.indexOf('<ConclusionPanel');

    expect(ribbonIndex).toBeGreaterThanOrEqual(0);
    expect(cardsIndex).toBeGreaterThan(ribbonIndex);
    expect(historyIndex).toBeGreaterThan(cardsIndex);
    expect(conclusionIndex).toBeGreaterThan(historyIndex);
    expect(source).toContain('border-inline-start: 1px solid var(--review-border);');
    expect(source).toContain('@media (min-width: 88rem)');
    expect(source).toContain('grid-template-columns: minmax(0, 1fr) minmax(22rem, 30rem);');
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
