import type { ReactNode } from 'react';
import type { TodayWorkspaceView } from '../../server/app/chronos-app';
import type { TodayActionDraft } from '../../server/app/route-contract';

// prettier-ignore
export type TodayDailyHeaderProps = { date: string; header: TodayWorkspaceView['header']; actionPath: string; goalsForm: ReactNode; draft?: Extract<TodayActionDraft, { action: 'today-save-daily-header' }>; actionError?: string | null; statusMessage?: string | null };

// prettier-ignore
export default function TodayDailyHeader({ date, header, actionPath, goalsForm, draft, actionError, statusMessage }: TodayDailyHeaderProps) {
  const focus = draft?.focus ?? header.focus;
  const constraints = draft?.constraints ?? header.constraints;
  const focusError = focus.length > 160 ? 'Keep the focus to 160 characters or fewer.' : null;
  const constraintsError =
    constraints.length > 500 ? 'Keep the constraints to 500 characters or fewer.' : null;
  const goals = [...header.goals].sort((a, b) => a.position - b.position).slice(0, 3);
  const isEmpty = header.state === 'empty' && goals.length === 0 && !draft;

  return (
    <section className="daily-header" aria-labelledby="daily-header-title">
      <header>
        <p>Daily Intention</p>
        <h2 id="daily-header-title" className="visually-hidden">
          Set Today’s Intention
        </h2>
        <time dateTime={date}>{date}</time>
      </header>
      {statusMessage ? (
        <p className="daily-header__status" role="status">
          {statusMessage}
        </p>
      ) : null}
      {actionError ? (
        <p className="daily-header__alert" role="alert">
          {actionError} Your draft is ready to correct.
        </p>
      ) : null}
      {isEmpty ? (
        <p className="daily-header__empty">No focus, objectives, or constraints yet.</p>
      ) : null}
      {header.state === 'error' ? (
        <div className="daily-header__alert" role="alert">
          Daily intention unavailable. <a href={actionPath}>Try loading it again.</a>
        </div>
      ) : null}
      {header.state !== 'error' || draft ? (
        <form method="post" action={actionPath} className="daily-header__form">
          <input type="hidden" name="action" value="today-save-daily-header" />
          <div className="daily-header__field">
            <label>
              Focus
              <input
                name="focus"
                defaultValue={focus}
                maxLength={160}
                autoComplete="off"
                aria-invalid={focusError ? true : undefined}
                aria-describedby={focusError ? 'daily-focus-error' : 'daily-header-help'}
                autoFocus={Boolean(focusError)}
              />
            </label>
            {focusError ? (
              <span id="daily-focus-error" className="daily-header__error">
                {focusError}
              </span>
            ) : null}
          </div>
          <div className="daily-header__field">
            <label>
              Constraints
              <textarea
                name="constraints"
                defaultValue={constraints}
                maxLength={500}
                autoComplete="off"
                aria-invalid={constraintsError ? true : undefined}
                aria-describedby={constraintsError ? 'daily-constraints-error' : 'daily-header-help'}
                autoFocus={!focusError && Boolean(constraintsError)}
              />
            </label>
            {constraintsError ? (
              <span id="daily-constraints-error" className="daily-header__error">
                {constraintsError}
              </span>
            ) : null}
          </div>
          <p id="daily-header-help">
            Surrounding spaces are removed when saved. Leave both fields blank to clear only focus
            and constraints.
          </p>
          <button type="submit">Save Intention</button>
        </form>
      ) : null}
      <div className="daily-header__objectives" aria-labelledby="daily-objectives-title">
        <h3 id="daily-objectives-title">Objectives</h3>
        {goals.length ? (
          <ol>
            {goals.map((goal) => (
              <li key={goal.id}>{goal.title}</li>
            ))}
          </ol>
        ) : (
          <p>No objectives yet.</p>
        )}
        {goalsForm}
      </div>
      <style>{styles}</style>
    </section>
  );
}

const styles = `
.daily-header .visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.daily-header{min-width:0;color:var(--chronos-text,var(--foreground,#0f172a));background:var(--chronos-surface,var(--card,#fff));border:1px solid var(--chronos-border,var(--border,rgba(99,102,241,.22)));border-radius:var(--radius,1rem);padding:clamp(1rem,2vw,1.5rem);overflow-wrap:anywhere}.daily-header *{box-sizing:border-box;min-width:0}.daily-header>header{display:flex;align-items:baseline;gap:.65rem;flex-wrap:wrap}.daily-header>header p,.daily-header>header h2{margin:0}.daily-header>header p{color:var(--chronos-primary,var(--primary,#4f46e5));font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.daily-header>header time{margin-left:auto;color:var(--chronos-text-muted,var(--muted-foreground,#475569));font-variant-numeric:tabular-nums}.daily-header__form{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:.65rem;margin-top:1rem}.daily-header__field{display:grid;gap:.3rem;min-width:0}.daily-header label{display:grid;gap:.3rem;font-weight:750}.daily-header input,.daily-header textarea,.daily-header button{width:100%;max-width:100%;min-height:44px}.daily-header textarea{min-height:5rem;resize:vertical}.daily-header button{align-self:end;border:0;border-radius:.7rem;background:var(--chronos-primary,var(--primary,#4f46e5));color:var(--chronos-button-text,#fff);font-weight:800;cursor:pointer}.daily-header input:focus-visible,.daily-header textarea:focus-visible,.daily-header button:focus-visible,.daily-header a:focus-visible{outline:3px solid var(--chronos-ring,var(--ring,#818cf8));outline-offset:2px}.daily-header__alert,.daily-header__status,.daily-header__empty{padding:.7rem;border-radius:.7rem;background:var(--chronos-surface-muted,var(--muted,#f1f5f9))}.daily-header__alert,.daily-header__error{color:var(--chronos-destructive,#b91c1c)}.daily-header__objectives{margin-top:1rem;border-top:1px solid var(--chronos-border,var(--border,#cbd5e1));padding-top:1rem}.daily-header__objectives h3{margin:0}.daily-header__objectives li{overflow-wrap:anywhere}@media(max-width:48rem){.daily-header>header time{margin-left:0;width:100%}.daily-header__form{grid-template-columns:1fr}}`;
