import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodayQuickBlock from './TodayQuickBlock';

const defaults = {
  date: '2026-07-14',
  startTime: '09:00',
  endTime: '10:00',
};

function renderQuickBlock(props: Partial<React.ComponentProps<typeof TodayQuickBlock>> = {}) {
  return renderToStaticMarkup(
    createElement(TodayQuickBlock, {
      actionPath: '/app/today',
      todayDate: defaults.date,
      quickBlockDefaults: defaults,
      recentNames: ['Deep Work', 'Admin'],
      ...props,
    }),
  );
}

describe('TodayQuickBlock', () => {
  it('renders the existing creation contract with inline duration and recent-name controls', () => {
    const html = renderQuickBlock();

    expect(html).toContain('name="action" value="create-planned-block"');
    expect(html).toContain('name="feedbackOrigin" value="today-quick-block"');
    expect(html).toContain('name="title"');
    expect(html).toContain('data-quick-block-title');
    for (const field of ['category', 'date', 'startTime', 'endTime']) {
      expect(html).toContain(`name="${field}"`);
    }
    for (const duration of ['30', '60', '90', '120']) {
      expect(html).toContain(`data-duration-minutes="${duration}"`);
    }
    expect(html).toContain('data-recent-block-name="Deep Work"');
    expect(html).toMatch(
      /<form[^>]*data-quick-schedule-selector="true"[^>]*data-today-date="2026-07-14"/,
    );
    expect(html).not.toMatch(/<fieldset[^>]*data-quick-schedule-selector/);
    expect(html).toContain('role="status"');
    expect(html).toMatch(
      /summary\{font-weight:800;min-height:44px[\s\S]*\.today-quick-block__recent button\{min-width:0;max-width:100%;overflow-wrap:anywhere;white-space:normal\}[\s\S]*@media \(prefers-reduced-motion:reduce\)\{\.today-quick-block,\.today-quick-block \*\{transition-duration:\.01ms!important/,
    );
    expect(html).not.toContain('<dialog');
    expect(html).not.toContain('collision-free');
  });

  it('preserves a server-rejected schedule draft and reports the error inline', () => {
    const html = renderQuickBlock({
      draft: {
        title: 'Late focus',
        category: 'home',
        date: '2026-07-14',
        startTime: '23:45',
        endTime: '23:59',
      },
      actionError: 'End time must be after start time.',
    });

    expect(html).toContain('<details open="">');
    expect(html).toContain('value="Late focus"');
    expect(html).toContain('<option value="home" selected="">Home</option>');
    expect(html).toContain('value="23:45"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('End time must be after start time.');
  });

  it('omits suggestions when no recent names are available while retaining keyboard-operable labels', () => {
    const html = renderQuickBlock({ recentNames: [], statusMessage: 'Block added.' });

    expect(html).not.toContain('Recent names');
    expect(html).toContain('<label for="today-quick-block-title">Block name</label>');
    expect(html).toContain('<label for="quick-block-date">Date</label>');
    expect(html).toContain('Block added.');
  });
});
