import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import QuickTaskCapture, { type QuickTaskCaptureProps } from './QuickTaskCapture';

const defaultBlocks = [
  { id: 'block-1', title: 'Deep work', phase: 'execution' },
  { id: 'block-2', title: 'Admin sweep', phase: 'planning' },
] satisfies QuickTaskCaptureProps['blocks'];

function renderQuickTaskCapture(overrides: Partial<QuickTaskCaptureProps> = {}) {
  return renderToStaticMarkup(
    createElement(QuickTaskCapture, {
      blocks: defaultBlocks,
      currentBlockId: 'block-1',
      currentBlockTitle: 'Deep work',
      ...overrides,
    }),
  );
}

describe('QuickTaskCapture', () => {
  it('renders the active block as the visible selected default while keeping targets selectable', () => {
    const html = renderQuickTaskCapture();

    expect(html).toContain('Add a task for today');
    expect(html).toContain('Targeting Deep work. You can change it before adding the task.');
    expect(html).toMatch(/<select[\s\S]*name="blockId"[\s\S]*required/);
    expect(html).toMatch(
      /<option(?=[^>]*value="block-1")(?=[^>]*selected="")[^>]*>Deep work · execution<\/option>/,
    );
    expect(html).toContain('<option value="block-2">Admin sweep · planning</option>');
  });

  it('requires an explicit target when blocks exist but no current block is eligible', () => {
    const html = renderQuickTaskCapture({ currentBlockId: null, currentBlockTitle: null });

    expect(html).toContain('Choose a target block before adding the task.');
    expect(html).toMatch(
      /<option(?=[^>]*value="")(?=[^>]*disabled="")(?=[^>]*selected="")[^>]*>Choose a block<\/option>/,
    );
    expect(html).toMatch(/<select[\s\S]*name="blockId"[\s\S]*required/);
    expect(html).toMatch(/<button type="submit">Add task<\/button>/);
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*>Add task<\/button>/);
  });

  it('keeps long block labels intact inside the bounded target control', () => {
    const longTitle =
      'A very long active block title that must remain readable without widening the action rail';
    const html = renderQuickTaskCapture({
      blocks: [{ id: 'long-block', title: longTitle, phase: 'execution' }],
      currentBlockId: 'long-block',
      currentBlockTitle: longTitle,
    });

    expect(html).toContain(`Targeting ${longTitle}. You can change it before adding the task.`);
    expect(html).toContain(`${longTitle} · execution`);
    expect(html).toMatch(/<select[\s\S]*name="blockId"[\s\S]*required/);
  });

  it('disables quick capture and shows guidance when there are no eligible blocks', () => {
    const html = renderQuickTaskCapture({
      blocks: [],
      currentBlockId: null,
      currentBlockTitle: null,
    });

    expect(html).toContain('Create or start a block first.');
    expect(html).toMatch(/<input[\s\S]*name="title"[\s\S]*disabled=""/);
    expect(html).toMatch(/<select[\s\S]*name="blockId"[\s\S]*disabled=""/);
    expect(html).toContain('<button type="submit" disabled="">Add task</button>');
    expect(html).not.toContain('value="block-1"');
    expect(html).not.toContain('value="block-2"');
  });

  it('preserves the same-route create-task payload contract', () => {
    const html = renderQuickTaskCapture();

    expect(html).toMatch(/<form(?=[^>]*method="post")[^>]*>/);
    expect(html).toContain('name="action" value="create-task"');
    expect(html).toMatch(/<select[\s\S]*name="blockId"/);
    expect(html).toMatch(/<input[\s\S]*name="title"/);
    expect(html).not.toContain('action="/');
  });

  it('uses native title validation for empty and whitespace-only values', () => {
    const html = renderQuickTaskCapture();

    expect(html).toMatch(
      /<input(?=[^>]*name="title")(?=[^>]*required)(?=[^>]*maxLength="120")[^>]*>/,
    );
    expect(html).toContain('pattern=".*\\S.*"');
    expect(html).toContain('title="Enter a task title."');
  });

  it('labels and describes controls without stealing focus', () => {
    const html = renderQuickTaskCapture();

    expect(html).toContain('aria-labelledby="quick-task-capture-heading"');
    expect(html).toContain('<h3 id="quick-task-capture-heading">Add a task for today</h3>');
    expect(html).toContain('for="quick-task-capture-title-input"');
    expect(html).toContain('for="quick-task-capture-block-select"');
    expect(html).toContain(
      'aria-describedby="quick-task-capture-help quick-task-capture-title-note"',
    );
    expect(html).toContain('id="quick-task-capture-help"');
    expect(html).toContain('id="quick-task-capture-title-note"');
    expect(html).not.toContain('autofocus');

    const titleIndex = html.indexOf('id="quick-task-capture-title-input"');
    const selectIndex = html.indexOf('id="quick-task-capture-block-select"');
    const submitIndex = html.indexOf('<button type="submit"');

    expect(titleIndex).toBeGreaterThanOrEqual(0);
    expect(selectIndex).toBeGreaterThan(titleIndex);
    expect(submitIndex).toBeGreaterThan(selectIndex);
  });

  it('renders CSS containment markers for narrow screens', () => {
    const html = renderQuickTaskCapture();

    expect(html).toMatch(
      /\.quick-task-capture\s*\{[\s\S]*min-width: 0;[\s\S]*max-width: 100%;[\s\S]*box-sizing: border-box;/,
    );
    expect(html).toMatch(
      /\.quick-task-capture__form\s*\{[\s\S]*display: grid;[\s\S]*grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 12rem\), 1fr\)\);[\s\S]*min-width: 0;/,
    );
    expect(html).not.toContain(
      'minmax(min(100%, 16rem), 1.15fr) minmax(min(100%, 13rem), 0.85fr) auto',
    );
    expect(html).toMatch(
      /\.quick-task-capture input,[\s\S]*\.quick-task-capture select,[\s\S]*\.quick-task-capture button\s*\{[\s\S]*max-width: 100%;[\s\S]*box-sizing: border-box;/,
    );
    expect(html).toMatch(
      /@media \(max-width: 48rem\)\s*\{[\s\S]*\.quick-task-capture__form\s*\{[\s\S]*grid-template-columns: 1fr;/,
    );
  });

  it('adds safe top spacing below the Today actions heading', () => {
    const html = renderQuickTaskCapture();

    expect(html).toMatch(
      /\.quick-task-capture\s*\{[\s\S]*margin-top: clamp\(0\.75rem, 1\.8vw, 1\.25rem\);/,
    );
  });

  it('styles the submit control with Chronos primary button tokens', () => {
    const html = renderQuickTaskCapture();

    expect(html).toMatch(
      /\.quick-task-capture button\s*\{[\s\S]*background: var\(--app-primary, var\(--chronos-primary, #4f46e5\)\);/,
    );
    expect(html).toMatch(
      /\.quick-task-capture button\s*\{[\s\S]*color: var\(--app-button-text, var\(--chronos-button-text, #ffffff\)\);/,
    );
    expect(html).toMatch(
      /\.quick-task-capture button:hover:not\(:disabled\)\s*\{[\s\S]*background: var\(--app-primary-strong, var\(--chronos-primary-strong, #4338ca\)\);/,
    );
  });
});
