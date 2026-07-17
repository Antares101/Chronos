import type { TodayQuickBlockDefaults } from '../../server/app/chronos-app';
import { buildQuickSchedulePreview } from './quick-schedule-selector';

export type TodayQuickBlockDraft = {
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
};

export type TodayQuickBlockProps = {
  actionPath: string;
  todayDate: string;
  quickBlockDefaults: TodayQuickBlockDefaults;
  recentNames: readonly string[];
  draft?: TodayQuickBlockDraft;
  actionError?: string | null;
  statusMessage?: string | null;
};

const categories = [
  { value: 'work', label: 'Work' },
  { value: 'home', label: 'Home' },
  { value: 'training', label: 'Training' },
];
const durations = [
  { minutes: 30, label: '30m' },
  { minutes: 60, label: '1h' },
  { minutes: 90, label: '1h 30m' },
  { minutes: 120, label: '2h' },
];
export default function TodayQuickBlock({
  actionPath,
  todayDate,
  quickBlockDefaults,
  recentNames,
  draft,
  actionError,
  statusMessage,
}: TodayQuickBlockProps) {
  const schedule = draft ?? { ...quickBlockDefaults, title: '', category: 'work' as const };
  const preview = buildQuickSchedulePreview({ todayDate, ...schedule });

  return (
    <section className="today-quick-block" aria-labelledby="today-quick-block-heading">
      <header>
        <p>Quick block</p>
        <h2 id="today-quick-block-heading">Add a block</h2>
      </header>
      <form
        method="post"
        action={actionPath}
        data-quick-schedule-selector
        data-today-date={todayDate}
      >
        <input type="hidden" name="action" value="create-planned-block" />
        <input type="hidden" name="feedbackOrigin" value="today-quick-block" />
        <label htmlFor="today-quick-block-title">Block name</label>
        <input
          id="today-quick-block-title"
          data-quick-block-title
          name="title"
          required
          maxLength={120}
          defaultValue={schedule.title}
          aria-describedby={actionError ? 'today-quick-block-error' : undefined}
        />
        <div className="today-quick-block__presets">
          {recentNames.length > 0 ? (
            <div className="today-quick-block__recent" role="group" aria-label="Recent names">
              <span>Recent names</span>
              {recentNames.map((name) => (
                <button key={name} type="button" data-recent-block-name={name}>
                  {name}
                </button>
              ))}
            </div>
          ) : null}
          <div
            className="today-quick-block__durations"
            role="group"
            aria-label="Duration shortcuts"
          >
            {durations.map(({ minutes, label }) => (
              <button
                key={minutes}
                type="button"
                data-duration-minutes={minutes}
                aria-label={`Set duration to ${minutes} minutes`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <details open={Boolean(draft && actionError)}>
          <summary>Schedule &amp; category</summary>
          <fieldset>
            <legend>Schedule</legend>
            <label htmlFor="quick-block-category">Category</label>
            <select
              id="quick-block-category"
              name="category"
              defaultValue={schedule.category}
              required
            >
              {categories.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <label htmlFor="quick-block-date">Date</label>
            <input
              id="quick-block-date"
              data-quick-schedule-date
              name="date"
              type="date"
              required
              defaultValue={schedule.date}
            />
            <label htmlFor="quick-block-start">Start</label>
            <input
              id="quick-block-start"
              data-quick-schedule-start
              name="startTime"
              type="time"
              required
              defaultValue={schedule.startTime}
            />
            <label htmlFor="quick-block-end">End</label>
            <input
              id="quick-block-end"
              data-quick-schedule-end
              name="endTime"
              type="time"
              required
              defaultValue={schedule.endTime}
            />
            <output aria-live="polite" htmlFor="quick-block-date quick-block-start quick-block-end">
              <strong data-quick-schedule-window>{preview.windowLabel}</strong>
              <span data-quick-schedule-duration>{preview.durationLabel}</span>
            </output>
            <p data-quick-schedule-status role="status" aria-live="polite">
              {preview.statusLabel}
            </p>
          </fieldset>
        </details>
        {actionError ? (
          <p id="today-quick-block-error" role="alert">
            {actionError}
          </p>
        ) : null}
        <p className="today-quick-block__status" role="status">
          {statusMessage}
        </p>
        <button type="submit">Create block</button>
      </form>
      <style>{styles}</style>
    </section>
  );
}

const styles = `
  .today-quick-block{min-width:0;border:1px solid var(--chronos-border,var(--border,#cbd5e1));border-radius:var(--radius,1rem);background:var(--chronos-surface,var(--card,#fff));padding:clamp(1rem,2vw,1.5rem)}
  .today-quick-block header,.today-quick-block form,.today-quick-block fieldset,.today-quick-block output{display:grid;gap:.65rem;min-width:0}.today-quick-block header p,.today-quick-block h2,.today-quick-block p{margin:0}.today-quick-block header>p{color:var(--chronos-primary,var(--primary,#4f46e5));font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.today-quick-block label{font-weight:800}.today-quick-block summary{min-height:44px;color:var(--chronos-text-muted,var(--muted-foreground,#475569));font-weight:750;cursor:pointer}.today-quick-block details{margin-top:.25rem}.today-quick-block fieldset{margin:.65rem 0 0}.today-quick-block input,.today-quick-block select,.today-quick-block button{min-height:44px;max-width:100%}.today-quick-block__presets{display:grid;gap:.75rem;min-width:0;padding:.75rem;border:1px solid var(--chronos-border,var(--border,#cbd5e1));border-radius:.85rem;background:var(--chronos-surface-muted,var(--muted,#f1f5f9))}.today-quick-block__recent{display:flex;flex-wrap:wrap;gap:.5rem;min-width:0}.today-quick-block__recent span{flex-basis:100%;color:var(--chronos-text-muted,var(--muted-foreground,#475569));font-weight:700}.today-quick-block .today-quick-block__recent button{flex:0 1 auto;width:auto;min-width:44px;max-width:100%;padding-inline:.8rem;text-align:left;overflow-wrap:anywhere;white-space:normal}.today-quick-block__durations{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem;min-width:0}.today-quick-block .today-quick-block__presets button{border:1px solid var(--chronos-border,var(--border,#cbd5e1));background:var(--chronos-surface,var(--card,#fff));color:var(--chronos-text,var(--foreground,#0f172a));box-shadow:none}.today-quick-block .today-quick-block__presets button:hover{border-color:var(--chronos-primary,var(--primary,#4f46e5));background:var(--chronos-primary-soft,#e0e7ff)}.today-quick-block>form>button[type=submit]{width:100%;background:var(--chronos-primary,var(--primary,#4f46e5));color:var(--chronos-button-text,#fff)}.today-quick-block [role=alert]{color:var(--chronos-danger,#b91c1c);font-weight:700}.today-quick-block__status:empty{display:none}.today-quick-block :is(input,select,summary,button):focus-visible{outline:3px solid var(--chronos-ring,var(--ring,#818cf8));outline-offset:2px}@media (prefers-reduced-motion:reduce){.today-quick-block,.today-quick-block *{transition-duration:.01ms!important;animation-duration:.01ms!important}}
`;
