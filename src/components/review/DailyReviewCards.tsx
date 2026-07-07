export type DailyReviewTask = {
  id: string;
  title: string;
  status: 'todo' | 'done';
};

export type DailyReviewBlock = {
  id: string;
  title: string;
  tasks: readonly DailyReviewTask[];
};

export type DailyReviewCardsProps = {
  blocks: readonly DailyReviewBlock[];
};

export default function DailyReviewCards({ blocks }: DailyReviewCardsProps) {
  return (
    <div className="actions__grid daily-review-grid">
      {blocks.length === 0 ? (
        <article className="action-card action-card--wide daily-review-empty">
          <h3>No blocks ready to review</h3>
          <p className="empty-copy">Finish an execution block to close it here.</p>
        </article>
      ) : (
        blocks.map((block) => <DailyReviewCard block={block} key={block.id} />)
      )}
      <style>{dailyReviewCardsStyles}</style>
    </div>
  );
}

type DailyReviewCardProps = {
  block: DailyReviewBlock;
};

function DailyReviewCard({ block }: DailyReviewCardProps) {
  const openTasks = block.tasks.filter((task) => task.status !== 'done');
  const openItemsTitleId = `${block.id}-open-items`;
  const nextAdjustmentId = `${block.id}-next-adjustment`;
  const nextAdjustmentHelpId = `${block.id}-next-adjustment-help`;

  return (
    <article className="action-card daily-review-card">
      <header className="daily-review-card__header">
        <p className="daily-review-card__eyebrow">Block review</p>
        <h3>{block.title}</h3>
        <p>Mark what finished, review what was open, and save the next adjustment.</p>
      </header>

      <form method="post" className="conclusion-form daily-review-card__form">
        <input type="hidden" name="action" value="conclude-block" />
        <input type="hidden" name="blockId" value={block.id} />

        <fieldset className="daily-review-card__area">
          <legend>Finished tasks</legend>
          <p className="daily-review-card__helper">
            Check any task that finished during review. Anything left unchecked stays open.
          </p>
          {block.tasks.length === 0 ? (
            <p className="empty-copy">No tasks are attached to this block.</p>
          ) : (
            <ul className="daily-review-card__tasks" role="list">
              {block.tasks.map((task) => (
                <li key={task.id}>
                  <label className="checkbox-label daily-review-card__checkbox">
                    <input
                      type="checkbox"
                      name="completedTaskIds"
                      value={task.id}
                      defaultChecked={task.status === 'done'}
                    />
                    <span>{task.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <section className="daily-review-card__area" aria-labelledby={openItemsTitleId}>
          <h4 id={openItemsTitleId}>Still open for tomorrow planning</h4>
          <p className="daily-review-card__helper">
            These tasks were open when this review loaded. Check them above if they finished;
            Planning decides what happens next.
          </p>
          {openTasks.length === 0 ? (
            <p className="empty-copy">No open tasks for this block.</p>
          ) : (
            <ul className="daily-review-card__open-list" role="list">
              {openTasks.map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          )}
        </section>

        <label className="daily-review-card__area daily-review-card__control">
          <span>Notes (required)</span>
          <textarea name="notes" required rows={3} placeholder="What changed?" />
        </label>

        <div className="daily-review-card__area daily-review-card__control">
          <label htmlFor={nextAdjustmentId}>Adjustment for tomorrow planning</label>
          <p id={nextAdjustmentHelpId} className="daily-review-card__helper">
            Optional. Capture what tomorrow planning should account for.
          </p>
          <input
            id={nextAdjustmentId}
            name="nextAdjustment"
            aria-describedby={nextAdjustmentHelpId}
            placeholder="What should change next time?"
          />
        </div>

        <button type="submit">Save review</button>
      </form>
    </article>
  );
}

const dailyReviewCardsStyles = `
  .daily-review-grid {
    --app-route-grid-min: 26rem;
  }

  .daily-review-empty,
  .daily-review-card {
    min-width: 0;
  }

  .daily-review-card {
    display: grid;
    gap: clamp(0.8rem, 1.8vw, 1rem);
  }

  .daily-review-card__header {
    min-width: 0;
  }

  .daily-review-card__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .daily-review-card__header h3 {
    margin: 0;
  }

  .daily-review-card__header p:last-child {
    margin: 0.35rem 0 0;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.55;
  }

  .daily-review-card__form {
    display: grid;
    gap: 0.85rem;
    min-width: 0;
  }

  .daily-review-card__area {
    min-width: 0;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 16px;
    background: var(--chronos-surface-muted, #f1f5f9);
    padding: 0.85rem;
    overflow-wrap: anywhere;
  }

  .daily-review-card__area legend,
  .daily-review-card__area h4,
  .daily-review-card__control > span,
  .daily-review-card__control > label {
    margin: 0 0 0.45rem;
    color: var(--chronos-text, #0f172a);
    font-size: 1rem;
    font-weight: 850;
  }

  .daily-review-card__area h4 {
    margin-top: 0;
  }

  .daily-review-card__helper {
    margin: 0 0 0.65rem;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.5;
    font-size: 0.87rem;
    font-weight: 700;
  }

  .daily-review-card__tasks,
  .daily-review-card__open-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
    min-width: 0;
  }

  .daily-review-card__checkbox {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: 0.6rem;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .daily-review-card__checkbox input[type="checkbox"] {
    appearance: none;
    accent-color: var(--chronos-primary, #4f46e5);
    display: grid;
    place-content: center;
    width: 1.15rem;
    height: 1.15rem;
    min-width: 1.15rem;
    margin: 0.12rem 0 0;
    border: 2px solid color-mix(in srgb, var(--chronos-primary, #4f46e5) 58%, transparent);
    border-radius: 0.35rem;
    background: var(--chronos-surface, #ffffff);
    box-sizing: border-box;
    cursor: pointer;
  }

  .daily-review-card__checkbox input[type="checkbox"]:checked {
    border-color: var(--chronos-primary, #4f46e5);
    background: var(--chronos-primary, #4f46e5);
  }

  .daily-review-card__checkbox input[type="checkbox"]:checked::after {
    content: "";
    width: 0.32rem;
    height: 0.58rem;
    border: solid #ffffff;
    border-width: 0 0.14rem 0.14rem 0;
    transform: rotate(45deg) translate(-0.02rem, -0.03rem);
  }

  .daily-review-card__checkbox input[type="checkbox"]:focus-visible {
    outline: 3px solid var(--chronos-ring, rgba(79, 70, 229, 0.35));
    outline-offset: 3px;
    border-color: var(--chronos-primary, #4f46e5);
  }

  .daily-review-card__checkbox span {
    min-width: 0;
  }

  @media (forced-colors: active) {
    .daily-review-card__checkbox input[type="checkbox"] {
      appearance: auto;
      accent-color: Highlight;
    }

    .daily-review-card__checkbox input[type="checkbox"]:checked::after {
      content: none;
    }
  }

  .daily-review-card__open-list li {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 12px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text-muted, #475569);
    padding: 0.55rem 0.7rem;
    font-size: 0.87rem;
    font-weight: 750;
  }

  .daily-review-card__control {
    display: grid;
    gap: 0.45rem;
  }

  .daily-review-card__control textarea,
  .daily-review-card__control input {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 40rem) {
    .daily-review-grid {
      --app-route-grid-min: 100%;
    }

    .daily-review-card__form button {
      width: 100%;
    }
  }
`;
