export type TodayActionPlanningBlock = {
  id: string;
  title: string;
};

export type TodayActionBlock = {
  id: string;
  title: string;
  phase: string;
};

export type TodayActionsGridProps = {
  planningBlocks: readonly TodayActionPlanningBlock[];
  blocks: readonly TodayActionBlock[];
  todayDate: string;
  quickBlockDefaults: {
    date: string;
    startTime: string;
    endTime: string;
  };
  quickBlockPreview: {
    windowLabel: string;
    durationLabel: string;
    statusLabel: string;
  };
};

const startBlockHelperId = 'start-block-helper';
const highlightedEventHelperId = 'highlighted-event-helper';

export default function TodayActionsGrid({
  planningBlocks,
  blocks,
  todayDate,
  quickBlockDefaults,
  quickBlockPreview,
}: TodayActionsGridProps) {
  const hasPlanningBlocks = planningBlocks.length > 0;
  const hasBlocks = blocks.length > 0;

  return (
    <div className="actions__grid">
      <article className="action-card">
        <h3>Start planned block</h3>
        <form method="post">
          <input type="hidden" name="action" value="start-block" />
          <label>
            Planning block
            <select
              name="blockId"
              required
              disabled={!hasPlanningBlocks}
              aria-describedby={!hasPlanningBlocks ? startBlockHelperId : undefined}
            >
              {hasPlanningBlocks ? (
                planningBlocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.title}
                  </option>
                ))
              ) : (
                <option value="">No planned blocks ready to start</option>
              )}
            </select>
          </label>
          {!hasPlanningBlocks ? (
            <p id={startBlockHelperId} className="empty-copy start-block-helper">
              No planned blocks ready to start.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={!hasPlanningBlocks}
            aria-describedby={!hasPlanningBlocks ? startBlockHelperId : undefined}
          >
            Start block
          </button>
        </form>
      </article>

      <article className="action-card">
        <h3>Create block here</h3>
        <form method="post">
          <input type="hidden" name="action" value="create-planned-block" />
          <label>
            Title
            <input name="title" required maxLength={120} placeholder="Focused work" />
          </label>
          <label>
            Category
            <select name="category" required>
              <option value="work">Work</option>
              <option value="home">Home</option>
              <option value="training">Training</option>
            </select>
          </label>
          <fieldset
            className="quick-schedule"
            data-quick-schedule-selector
            data-today-date={todayDate}
          >
            <legend>Schedule</legend>
            <p id="quick-schedule-help" className="quick-schedule__helper">
              Check the block window before creating it.
            </p>
            <output
              id="quick-schedule-preview"
              className="quick-schedule__preview"
              htmlFor="quick-block-date quick-block-start quick-block-end"
              aria-live="polite"
            >
              <span className="quick-schedule__eyebrow">Block window</span>
              <strong data-quick-schedule-window>{quickBlockPreview.windowLabel}</strong>
              <span data-quick-schedule-duration>{quickBlockPreview.durationLabel}</span>
            </output>
            <div
              className="quick-schedule__fields"
              aria-describedby="quick-schedule-help quick-schedule-status"
            >
              <div className="quick-schedule__control quick-schedule__control--date">
                <label htmlFor="quick-block-date">Date</label>
                <input
                  id="quick-block-date"
                  data-quick-schedule-date
                  name="date"
                  type="date"
                  required
                  aria-describedby="quick-schedule-help quick-schedule-status"
                  defaultValue={quickBlockDefaults.date}
                />
              </div>
              <div className="quick-schedule__control">
                <label htmlFor="quick-block-start">Start</label>
                <input
                  id="quick-block-start"
                  data-quick-schedule-start
                  name="startTime"
                  type="time"
                  required
                  aria-describedby="quick-schedule-help quick-schedule-status"
                  defaultValue={quickBlockDefaults.startTime}
                />
              </div>
              <div className="quick-schedule__control">
                <label htmlFor="quick-block-end">End</label>
                <input
                  id="quick-block-end"
                  data-quick-schedule-end
                  name="endTime"
                  type="time"
                  required
                  aria-describedby="quick-schedule-help quick-schedule-status"
                  defaultValue={quickBlockDefaults.endTime}
                />
              </div>
            </div>
            <div className="quick-schedule__shortcuts" role="group" aria-label="Duration shortcuts">
              <button
                type="button"
                data-duration-minutes="30"
                aria-label="Set duration to 30 minutes"
              >
                30m
              </button>
              <button
                type="button"
                data-duration-minutes="60"
                aria-label="Set duration to 60 minutes"
              >
                1h
              </button>
              <button
                type="button"
                data-duration-minutes="90"
                aria-label="Set duration to 90 minutes"
              >
                1h 30m
              </button>
              <button
                type="button"
                data-duration-minutes="120"
                aria-label="Set duration to 120 minutes"
              >
                2h
              </button>
            </div>
            <p
              id="quick-schedule-status"
              className="quick-schedule__status"
              data-quick-schedule-status
              role="status"
              aria-live="polite"
            >
              {quickBlockPreview.statusLabel}
            </p>
          </fieldset>
          <button type="submit">Create block</button>
        </form>
      </article>

      <article className="action-card">
        <h3>Add highlighted event</h3>
        <form method="post">
          <input type="hidden" name="action" value="create-highlighted-event" />
          <label>
            Target block
            <select
              name="blockId"
              required
              disabled={!hasBlocks}
              defaultValue=""
              aria-describedby={!hasBlocks ? highlightedEventHelperId : undefined}
            >
              {hasBlocks ? (
                blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.title} · {block.phase}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Create or start a block first
                </option>
              )}
            </select>
          </label>
          <label>
            Event title
            <input
              name="title"
              required
              maxLength={120}
              placeholder="Important handoff"
              disabled={!hasBlocks}
              aria-describedby={!hasBlocks ? highlightedEventHelperId : undefined}
            />
          </label>
          {!hasBlocks ? (
            <p id={highlightedEventHelperId} className="empty-copy">
              Create or start a block before adding tasks or events.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={!hasBlocks}
            aria-describedby={!hasBlocks ? highlightedEventHelperId : undefined}
          >
            Add highlighted event
          </button>
        </form>
      </article>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .start-block-helper {
    margin: -0.2rem 0 0;
    font-size: 0.84rem;
    line-height: 1.4;
  }

  .quick-schedule {
    display: grid;
    gap: 0.8rem;
    min-width: 0;
    margin: 0;
    padding: clamp(0.85rem, 2vw, 1rem);
    border: 1px solid var(--app-border, rgba(99, 102, 241, 0.22));
    border-radius: 1rem;
    background: linear-gradient(
      135deg,
      var(--app-surface-muted, rgba(241, 245, 249, 0.86)),
      var(--app-surface-tinted, rgba(238, 242, 255, 0.72))
    );
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
  }

  .quick-schedule legend {
    padding: 0 0.35rem;
    color: var(--app-text, var(--foreground, #0f172a));
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .quick-schedule__helper,
  .quick-schedule__status {
    margin: 0;
    color: var(--app-text-muted, var(--muted-foreground, #64748b));
    font-size: 0.84rem;
    line-height: 1.45;
  }

  .quick-schedule__preview {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
    padding: 0.75rem 0.85rem;
    border: 1px solid var(--app-border, rgba(99, 102, 241, 0.2));
    border-left: 0.28rem solid var(--primary, #4f46e5);
    border-radius: 0.85rem;
    background: var(--app-surface, var(--card, #ffffff));
    color: var(--app-text, var(--foreground, #0f172a));
  }

  .quick-schedule__preview strong {
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: clamp(1rem, 2vw, 1.1rem);
  }

  .quick-schedule__preview span:last-child {
    color: var(--app-text-muted, var(--muted-foreground, #64748b));
    font-size: 0.86rem;
    font-weight: 700;
  }

  .quick-schedule__eyebrow {
    color: var(--app-accent, var(--primary, #4f46e5));
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .quick-schedule__fields,
  .quick-schedule__shortcuts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 7.5rem), 1fr));
    gap: 0.75rem;
    min-width: 0;
  }

  .quick-schedule__shortcuts {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 4.75rem), 1fr));
  }

  .quick-schedule__control {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
  }

  .quick-schedule__control label {
    min-width: 0;
    color: var(--app-text-muted, var(--muted-foreground, #64748b));
    font-size: 0.78rem;
    font-weight: 800;
  }

  .quick-schedule__control input,
  .quick-schedule__shortcuts button {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .quick-schedule__shortcuts button {
    min-height: 2.35rem;
    border: 1px solid var(--app-border-strong, rgba(99, 102, 241, 0.32));
    border-radius: 999px;
    background: var(--app-surface, var(--card, #ffffff));
    color: var(--app-text, var(--foreground, #0f172a));
    font-weight: 800;
  }

  .quick-schedule__shortcuts button:hover,
  .quick-schedule__shortcuts button:focus-visible {
    border-color: var(--primary, #4f46e5);
  }

  @media (max-width: 40rem) {
    .quick-schedule__fields {
      grid-template-columns: 1fr;
    }

    .quick-schedule__control--date {
      grid-column: 1 / -1;
    }
  }
`;
