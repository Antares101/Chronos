import type { DaySheetRow } from '../../domain/services/today-workspace';
import { getCategoryTheme } from '../schedule/theme';
import { formatTimeLabel } from '../schedule/time';
import { TodayInlineBlockActions } from './TodayBlockActions';
import type { TodayBlockDetail } from './TodayBlockRow';
import TodayBlockTaskList from './TodayBlockTaskList';

export type TodayActiveBlockProps = {
  row: Extract<DaySheetRow, { kind: 'block' }> | null;
  detail: TodayBlockDetail | null;
  actionPath: string;
  quickBlockAnchor: string;
  conclusionFeedback?: { actionError?: string | null; statusMessage?: string | null };
};

export default function TodayActiveBlock({
  row,
  detail,
  actionPath,
  quickBlockAnchor,
  conclusionFeedback,
}: TodayActiveBlockProps) {
  if (!row) return <NoActiveBlock quickBlockAnchor={quickBlockAnchor} />;

  const theme = getCategoryTheme(row.block.category);
  const incompleteTasks = detail?.tasks.filter((task) => task.status !== 'done') ?? [];
  const stateLabel = row.lifecycle === 'paused' ? 'Paused' : 'Active';

  return (
    <section
      className="today-active-block"
      data-state={row.lifecycle}
      aria-labelledby="today-active-block-title"
    >
      <header className="today-active-block__header">
        <div>
          <p className="today-active-block__eyebrow">Current execution</p>
          <h2 id="today-active-block-title">{row.block.title}</h2>
        </div>
        <p className="today-active-block__state">{stateLabel}</p>
      </header>
      <p className="today-active-block__context">
        <span>{theme.label}</span>
        <span>
          <time dateTime={row.clippedStart}>{formatTimeLabel(row.clippedStart)}</time> –{' '}
          <time dateTime={row.clippedEnd}>{formatTimeLabel(row.clippedEnd)}</time>
        </span>
      </p>
      {!detail ? (
        <p className="today-active-block__unavailable" role="status">
          Block details are unavailable.
        </p>
      ) : (
        <>
          <section
            className="today-active-block__tasks"
            aria-labelledby="today-active-block-tasks-title"
          >
            <div className="today-active-block__section-heading">
              <h3 id="today-active-block-tasks-title">Tasks</h3>
              {detail.tasks.length ? (
                <p>
                  {incompleteTasks.length} incomplete task{incompleteTasks.length === 1 ? '' : 's'}
                </p>
              ) : null}
            </div>
            {detail.tasks.length ? (
              incompleteTasks.length ? (
                <TodayBlockTaskList
                  actionPath={actionPath}
                  blockTitle={row.block.title}
                  tasks={incompleteTasks}
                />
              ) : (
                <p className="today-active-block__empty">No incomplete tasks in this block.</p>
              )
            ) : (
              <p className="today-active-block__empty">No tasks in this block.</p>
            )}
          </section>
          {detail.highlightedEvents?.length ? (
            <section
              className="today-active-block__context-list"
              aria-labelledby="today-active-block-events-title"
            >
              <h3 id="today-active-block-events-title">Highlighted events</h3>
              <ul>
                {detail.highlightedEvents.map((event) => (
                  <li key={event.id}>{event.title}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {detail.pauses.length ? (
            <section
              className="today-active-block__context-list"
              aria-labelledby="today-active-block-pauses-title"
            >
              <h3 id="today-active-block-pauses-title">Pauses</h3>
              <ul>
                {detail.pauses.map((pause) => (
                  <li key={pause.id}>
                    {pause.kind === 'untimed' ? 'Untimed' : pause.kind} ·{' '}
                    {pause.endedAt ? 'Ended' : 'Open'}
                    {pause.note ? ` · ${pause.note}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="today-active-block__actions" aria-label="Valid block actions">
            <TodayInlineBlockActions
              actionPath={actionPath}
              block={row.block}
              actions={detail.permittedActions}
              conclusionFeedback={conclusionFeedback}
            />
          </section>
        </>
      )}
      <style>{styles}</style>
    </section>
  );
}

function NoActiveBlock({ quickBlockAnchor }: Pick<TodayActiveBlockProps, 'quickBlockAnchor'>) {
  return (
    <section
      className="today-active-block today-active-block--empty"
      aria-labelledby="today-active-block-title"
    >
      <p className="today-active-block__eyebrow">Current execution</p>
      <h2 id="today-active-block-title">No active block</h2>
      <p>Choose the next block when you are ready to work.</p>
      <div className="today-active-block__links">
        <a href={quickBlockAnchor}>Capture a task</a>
        <a href="/app/planning">Open Planning</a>
      </div>
      <style>{styles}</style>
    </section>
  );
}

const styles = `
  .today-active-block{--today-active-rail:var(--chronos-primary,var(--primary,#4f46e5));min-width:0;overflow-wrap:anywhere;color:var(--chronos-text,var(--foreground,#0f172a));background:var(--chronos-surface,var(--card,#fff));border:1px solid var(--chronos-border,var(--border,rgba(99,102,241,.22)));border-inline-start:5px solid var(--today-active-rail);border-radius:var(--radius,1rem);padding:clamp(1rem,2vw,1.5rem);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--today-active-rail) 12%,transparent)}
  .today-active-block[data-state="paused"]{--today-active-rail:var(--chronos-sky,#0ea5e9)}.today-active-block--empty{--today-active-rail:var(--chronos-text-muted,var(--muted-foreground,#64748b))}.today-active-block *{box-sizing:border-box;min-width:0}.today-active-block__header,.today-active-block__context,.today-active-block__section-heading,.today-active-block__links{display:flex;align-items:baseline;gap:.65rem;flex-wrap:wrap}.today-active-block__header{justify-content:space-between}.today-active-block__header h2,.today-active-block h3,.today-active-block p{margin:0}.today-active-block__eyebrow{color:var(--today-active-rail);font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.today-active-block__header h2{margin-top:.2rem;text-wrap:balance}.today-active-block__state{border-radius:999px;background:var(--chronos-primary-soft,#e0e7ff);padding:.25rem .6rem;font-weight:800}.today-active-block__context{margin-top:.75rem;color:var(--chronos-text-muted,var(--muted-foreground,#475569))}.today-active-block__context span:first-child{font-weight:800}.today-active-block__tasks,.today-active-block__context-list,.today-active-block__actions{margin-top:1rem}.today-active-block__section-heading p,.today-active-block__empty,.today-active-block__unavailable{color:var(--chronos-text-muted,var(--muted-foreground,#475569))}.today-active-block__context-list ul{margin:.5rem 0 0;padding-inline-start:1.25rem}.today-active-block .today-block__tasks{margin:.5rem 0 0;padding-inline-start:1.25rem}.today-active-block .today-block__tasks li{display:flex;justify-content:space-between;gap:.75rem;flex-wrap:wrap}.today-active-block .today-block__actions{margin:0}.today-active-block .today-block__actions > .today-block__action-groups{display:grid}.today-active-block .today-block__actions summary{margin-bottom:.65rem}.today-active-block .today-close-review summary{min-height:44px;padding:.65rem;cursor:pointer;touch-action:manipulation}.today-active-block .today-block__actions button,.today-active-block a{min-height:44px}.today-active-block .today-block__actions form{display:grid;gap:.5rem;border:1px solid var(--chronos-border,var(--border,#cbd5e1));border-radius:.75rem;padding:.75rem}.today-active-block input,.today-active-block select,.today-active-block textarea,.today-active-block button{width:100%;max-width:100%;min-height:44px}.today-active-block a{display:inline-flex;align-items:center;color:var(--chronos-primary,var(--primary,#4f46e5));font-weight:800}.today-active-block a:focus-visible,.today-active-block button:focus-visible,.today-active-block input:focus-visible,.today-active-block select:focus-visible,.today-active-block textarea:focus-visible,.today-active-block summary:focus-visible{outline:3px solid var(--chronos-ring,var(--ring,#818cf8));outline-offset:3px}@media(max-width:48rem){.today-active-block__header{align-items:flex-start}.today-active-block .today-block__action-groups{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.today-active-block *{scroll-behavior:auto!important;transition:none!important}}@media(prefers-reduced-transparency:reduce){.today-active-block{box-shadow:none;background:var(--chronos-surface,var(--card,#fff))}}
`;
