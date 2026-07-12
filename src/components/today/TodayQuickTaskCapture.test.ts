import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayQuickTaskCapture, {
  claimQuickTaskSubmission,
  type TodayQuickTaskCaptureProps,
} from './TodayQuickTaskCapture';

const destinations: TodayQuickTaskCaptureProps['capture']['destinations'] = [
  { kind: 'block', blockId: 'active', label: 'Active focus' },
  { kind: 'block', blockId: 'owned', label: 'Owned alternative' },
  { kind: 'unassigned', label: 'Unassigned' },
];
const base = {
  capture: { defaultDestination: destinations[0], destinations },
  actionPath: '/app/today',
} satisfies TodayQuickTaskCaptureProps;
const render = (props: Partial<TodayQuickTaskCaptureProps> = {}) =>
  renderToStaticMarkup(createElement(TodayQuickTaskCapture, { ...base, ...props }));

describe('TodayQuickTaskCapture', () => {
  it('keeps the exact-one-active destination hidden for title-only one-submit capture', () => {
    const html = render();
    expect(html).toContain('name="action" value="today-create-task"');
    expect(html).toContain('name="destination" value="block:active"');
    expect(html).toContain('Target: Active focus');
    expect(html).not.toContain('<select');
    expect(html.match(/type="submit"/g)).toHaveLength(1);
  });

  it('reveals only owned destinations and deliberate unassigned override', () => {
    const html = render({ initialOverride: true, initialDestination: 'block:owned' });
    expect(html).toMatch(/<select(?=[^>]*name="destination")[^>]*required/);
    expect(html).toContain('value="block:owned" selected=""');
    expect(html).toContain('>Owned alternative</option>');
    expect(html).toContain('<option value="unassigned">Unassigned</option>');
    expect(html).not.toContain('foreign');
  });

  it('requires a visible deliberate destination for zero or ambiguous active blocks', () => {
    const html = render({ capture: { defaultDestination: null, destinations } });
    expect(html).toContain('No automatic target—choose where this task belongs.');
    expect(html).toMatch(/<select(?=[^>]*name="destination")[^>]*required/);
    expect(html).toContain('<option value="" selected="">Choose a destination</option>');
  });

  it('retains long failed drafts and never reports false success', () => {
    const title = 'x'.repeat(121);
    const html = render({
      draft: { action: 'today-create-task', title, destination: 'unassigned' },
      actionError: 'title must be at most 120 characters.',
      statusMessage: null,
    });
    expect(html).toContain(`value="${title}"`);
    expect(html).toContain('value="unassigned" selected=""');
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).not.toContain('role="status"');

    const rejected = render({
      draft: { action: 'today-create-task', title: 'Retry me', destination: 'block:owned' },
      actionError: 'That change could not be saved. Check the form and try again.',
      statusMessage: 'Task added.',
    });
    expect(rejected).toContain('value="Retry me"');
    expect(rejected).toContain('value="block:owned" selected=""');
    expect(rejected).not.toContain('role="status"');
  });

  it('announces the server-derived success destination', () => {
    const html = render({ statusMessage: 'Task added to Owned alternative.' });
    expect(html).toContain('role="status"');
    expect(html).toContain('Task added to Owned alternative.');
  });

  it('allows only one pending submission claim', () => {
    const pending = { current: false };
    expect(claimQuickTaskSubmission(pending)).toBe(true);
    expect(claimQuickTaskSubmission(pending)).toBe(false);
  });
});
