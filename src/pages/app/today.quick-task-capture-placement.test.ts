import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readTodaySource() {
  return readFileSync(new URL('./today.astro', import.meta.url), 'utf8');
}

describe('Today quick task capture placement', () => {
  it('renders QuickTaskCapture after the actions header and before the existing actions grid', () => {
    const source = readTodaySource();

    expect(source).toContain(
      "import QuickTaskCapture from '../../components/today/QuickTaskCapture';",
    );

    const headerIndex = source.indexOf('<div class="actions__header">');
    const captureIndex = source.indexOf('<QuickTaskCapture');
    const gridIndex = source.indexOf('<div class="actions__grid">');

    expect(headerIndex).toBeGreaterThanOrEqual(0);
    expect(captureIndex).toBeGreaterThan(headerIndex);
    expect(gridIndex).toBeGreaterThan(captureIndex);

    const captureEndIndex = source.indexOf('/>', captureIndex);
    const captureSource = source.slice(captureIndex, captureEndIndex);

    expect(captureEndIndex).toBeLessThan(gridIndex);
    expect(captureSource).not.toContain('client:');
  });

  it('passes Today blocks and current block context without changing existing action cards', () => {
    const source = readTodaySource();
    const captureIndex = source.indexOf('<QuickTaskCapture');

    expect(source).toContain(
      'blocks={appState.blocks.map(({ id, title, phase }) => ({ id, title, phase }))}',
    );
    expect(source).toContain('currentBlockId={appState.todayTaskPanel.currentBlockId}');
    expect(source).toContain('currentBlockTitle={appState.todayTaskPanel.currentBlockTitle}');

    for (const actionValue of [
      'start-block',
      'create-planned-block',
      'create-task',
      'create-highlighted-event',
    ]) {
      const actionIndex = source.indexOf(`value="${actionValue}"`);

      expect(actionIndex).toBeGreaterThan(captureIndex);
    }
  });
});
