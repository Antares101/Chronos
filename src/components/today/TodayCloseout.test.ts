import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TodayCloseout, { type TodayCloseoutProps } from './TodayCloseout';

const defaults: TodayCloseoutProps = {
  closeout: { outcome: '', tomorrowAdjustment: '', state: 'empty' },
  actionPath: '/app/today',
};
const render = (props: Partial<TodayCloseoutProps> = {}) =>
  renderToStaticMarkup(createElement(TodayCloseout, { ...defaults, ...props }));
const draft = (outcome: string, tomorrowAdjustment: string) => ({
  action: 'today-save-closeout' as const,
  outcome,
  tomorrowAdjustment,
});

describe('TodayCloseout', () => {
  it('renders the empty closeout with the exact W04 action and field limits', () => {
    const html = render();
    expect(html).toContain('Close the Day');
    expect(html).toContain('Record one outcome and one adjustment for tomorrow.');
    expect(html).toMatch(
      /(?=[\s\S]*today-save-closeout)(?=[\s\S]*name="outcome")(?=[\s\S]*maxLength="500")(?=[\s\S]*name="tomorrowAdjustment")(?=[\s\S]*maxLength="280")/,
    );
    expect(html.match(/<form/g)).toHaveLength(1);
    const status = render({ statusMessage: 'Daily closeout saved.' });
    expect(status).toContain('role="status"');
  });

  it('retains partial and blank drafts with field-specific accessible errors', () => {
    const html = render({
      draft: draft('Shipped the header', '   '),
      actionError: 'tomorrowAdjustment is required.',
    });
    expect(html).toContain('Shipped the header');
    expect(html).toMatch(
      /name="tomorrowAdjustment"[^>]*aria-invalid="true"[^>]*aria-describedby="closeout-adjustment-error"[^>]*autofocus=""/,
    );
    expect(html).toContain('Enter one adjustment for tomorrow.');
    expect(html).toContain('role="alert"');
  });

  it('focuses the first invalid field and reports both over-limit values', () => {
    const html = render({
      draft: draft('x'.repeat(501), 'y'.repeat(281)),
      actionError: 'That change could not be saved. Check the form and try again.',
    });
    expect(html).toMatch(
      /name="outcome"[^>]*aria-invalid="true"[^>]*aria-describedby="closeout-outcome-error"[^>]*autofocus=""/,
    );
    expect(html).toContain('Keep the outcome to 500 characters or fewer.');
    expect(html).toContain('Keep the adjustment to 280 characters or fewer.');
  });

  it('keeps each invalid field, error, helper copy, and action in its intended grid child', () => {
    const html = render({ draft: draft('x'.repeat(501), 'y'.repeat(281)) });
    const fields = html.match(/<div class="today-closeout__field">[\s\S]*?<\/div>/g) ?? [];

    expect(fields).toHaveLength(2);
    expect(fields[0]).toMatch(
      /<label>Outcome<textarea(?=[^>]*name="outcome")(?=[^>]*aria-invalid="true")(?=[^>]*aria-describedby="closeout-outcome-error")(?=[^>]*autofocus="")[^>]*>[^<]*<\/textarea><\/label><span id="closeout-outcome-error" class="today-closeout__error">Keep the outcome to 500 characters or fewer\.<\/span>/,
    );
    expect(fields[1]).toMatch(
      /<label>Tomorrow’s Adjustment<textarea(?=[^>]*name="tomorrowAdjustment")(?=[^>]*aria-invalid="true")(?=[^>]*aria-describedby="closeout-adjustment-error")[^>]*>[^<]*<\/textarea><\/label><span id="closeout-adjustment-error" class="today-closeout__error">Keep the adjustment to 280 characters or fewer\.<\/span>/,
    );
    expect(html).toMatch(
      /<form[^>]*class="today-closeout__form"[^>]*><input type="hidden" name="action" value="today-save-closeout"\/><div class="today-closeout__field">[\s\S]*?<\/div><div class="today-closeout__field">[\s\S]*?<\/div><p id="closeout-help">[\s\S]*?<\/p><button type="submit">Save Closeout<\/button><\/form>/,
    );
  });

  it('supports editing and revisiting a complete closeout', () => {
    const html = render({
      closeout: {
        outcome: 'Protected the review boundary',
        tomorrowAdjustment: 'Start with the focused test',
        state: 'ready',
      },
    });
    expect(html).toContain('Protected the review boundary');
    expect(html).toContain('Start with the focused test');
    expect(html).toContain('Update Closeout');
  });

  it('does not misrepresent a load failure as an empty closeout', () => {
    const html = render({ closeout: { outcome: '', tomorrowAdjustment: '', state: 'error' } });
    expect(html).toContain('Daily closeout unavailable.');
    expect(html).toContain('Try loading it again.');
    expect(html).not.toContain('Record one outcome and one adjustment for tomorrow.');
    expect(html).not.toContain('<form');
  });

  it('keeps a failed-action draft available when daily loading also fails', () => {
    const html = render({
      closeout: { outcome: '', tomorrowAdjustment: '', state: 'error' },
      draft: draft('Retained outcome', 'Retained adjustment'),
      actionError: 'That change could not be saved.',
    });
    expect(html).toMatch(
      /(?=[\s\S]*Daily closeout unavailable.)(?=[\s\S]*Your draft is ready to correct.)(?=[\s\S]*today-save-closeout)(?=[\s\S]*Retained outcome)(?=[\s\S]*Retained adjustment)/,
    );
  });
});
