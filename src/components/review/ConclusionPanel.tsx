import type { BlockCategory } from '../../domain/models';
import { formatDurationMinutes } from '../schedule/time';

export type ConclusionPanelTask = {
  id: string;
  title: string;
};

export type ConclusionPanelBlock = {
  id: string;
  title: string;
  category: BlockCategory;
};

export type ConclusionPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  block: ConclusionPanelBlock;
  completedTaskIds: readonly string[];
  completedTasks: readonly ConclusionPanelTask[];
  plannedMinutes: number;
  actualMinutes: number;
  notes: string;
  nextAdjustment?: string | null;
};

const categoryLabelByCode: Record<BlockCategory, string> = {
  work: 'Work',
  home: 'Home',
  training: 'Training',
};

export default function ConclusionPanel({
  eyebrow,
  title,
  description,
  block,
  completedTaskIds,
  completedTasks,
  plannedMinutes,
  actualMinutes,
  notes,
  nextAdjustment,
}: ConclusionPanelProps) {
  const deltaMinutes = actualMinutes - plannedMinutes;
  const signLabel = deltaMinutes === 0 ? 'on target' : deltaMinutes > 0 ? 'over' : 'under';

  const sortedCompletedTasks = [...completedTasks].sort((first, second) =>
    first.title.localeCompare(second.title),
  );

  return (
    <section className="conclusion-panel" aria-labelledby="conclusion-panel-title">
      <header className="conclusion-panel__header">
        <div>
          <p className="conclusion-panel__eyebrow">{eyebrow}</p>
          <h2 id="conclusion-panel-title">{title}</h2>
          <p>{description}</p>
        </div>
        <span className="conclusion-panel__status">{categoryLabelByCode[block.category]}</span>
      </header>

      <article className="conclusion-panel__summary" aria-label="Block conclusion summary">
        <h3>{block.title}</h3>
        <dl>
          <div className="conclusion-panel__metric">
            <dt>Planned</dt>
            <dd>{formatDurationMinutes(plannedMinutes)}</dd>
          </div>
          <div className="conclusion-panel__metric">
            <dt>Actual</dt>
            <dd>{formatDurationMinutes(actualMinutes)}</dd>
          </div>
          <div className="conclusion-panel__metric conclusion-panel__metric--delta">
            <dt>Variance</dt>
            <dd
              className={
                deltaMinutes >= 0
                  ? 'conclusion-panel__delta--over'
                  : 'conclusion-panel__delta--under'
              }
            >
              {deltaMinutes >= 0 ? '+' : ''}
              {formatDurationMinutes(deltaMinutes)} ({signLabel})
            </dd>
          </div>
        </dl>
      </article>

      <section className="conclusion-panel__group" aria-labelledby="conclusion-tasks-title">
        <h3 id="conclusion-tasks-title">Completed tasks</h3>

        {completedTaskIds.length === 0 ? (
          <p className="conclusion-panel__empty">No tasks were marked complete.</p>
        ) : null}

        {completedTaskIds.length > 0 ? (
          <ul className="conclusion-panel__tasks" role="list" aria-label="Completed tasks">
            {sortedCompletedTasks.map((task) => (
              <li key={task.id} className="conclusion-panel__task">
                {task.title}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="conclusion-panel__group" aria-labelledby="conclusion-notes-title">
        <h3 id="conclusion-notes-title">Notes</h3>
        <p>{notes || 'No notes were added for this block.'}</p>
      </section>

      <section className="conclusion-panel__group" aria-labelledby="conclusion-next-title">
        <h3 id="conclusion-next-title">Next adjustment</h3>
        <p>{nextAdjustment ?? 'No next adjustment was added.'}</p>
      </section>

      <style>{conclusionPanelStyles}</style>
    </section>
  );
}

const conclusionPanelStyles = `
  .conclusion-panel {
    min-width: 0;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
    display: grid;
    gap: 1rem;
  }

  .conclusion-panel__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 18px;
    padding: 1rem;
    background: var(
      --chronos-header-surface,
      linear-gradient(135deg, var(--chronos-surface, #ffffff) 0%, var(--chronos-surface-tinted, #eef2ff) 100%)
    );
    min-width: 0;
  }

  .conclusion-panel__header > div {
    min-width: 0;
  }

  .conclusion-panel__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .conclusion-panel h2 {
    margin: 0;
    font-size: clamp(1.25rem, 2.6vw, 1.8rem);
    letter-spacing: -0.03em;
  }

  .conclusion-panel__header p {
    margin: 0.35rem 0 0;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.5;
  }

  .conclusion-panel__status {
    flex: 0 0 auto;
    border-radius: 999px;
    background: var(--chronos-sky-soft, #e0f2fe);
    color: var(--chronos-sky-text, #0c4a6e);
    font-size: 0.76rem;
    font-weight: 800;
    padding: 0.45rem 0.75rem;
  }

  .conclusion-panel__summary {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 16px;
    padding: 0.85rem;
    background: var(--chronos-surface, #ffffff);
  }

  .conclusion-panel__summary h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }

  .conclusion-panel__summary dl {
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.45rem;
  }

  .conclusion-panel__metric {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 0.4rem;
    align-items: center;
    border-bottom: 1px dashed var(--chronos-border, rgba(148, 163, 184, 0.22));
    padding-bottom: 0.45rem;
  }

  .conclusion-panel__metric:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .conclusion-panel__metric dt {
    margin: 0;
    color: var(--chronos-text-muted, #475569);
    font-weight: 800;
  }

  .conclusion-panel__metric dd {
    margin: 0;
    font-weight: 800;
    color: var(--chronos-text, #0f172a);
  }

  .conclusion-panel__delta--over {
    color: var(--chronos-success-text, #065f46);
  }

  .conclusion-panel__delta--under {
    color: var(--chronos-danger-text, #b91c1c);
  }

  .conclusion-panel__group {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 16px;
    padding: 0.85rem;
    background: var(--chronos-surface-muted, #f1f5f9);
  }

  .conclusion-panel__group h3 {
    margin: 0 0 0.45rem;
    font-size: 1rem;
  }

  .conclusion-panel__empty {
    margin: 0;
    color: var(--chronos-text-soft, #64748b);
    font-size: 0.86rem;
    font-weight: 700;
  }

  .conclusion-panel__tasks {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.45rem;
  }

  .conclusion-panel__task {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 12px;
    padding: 0.55rem 0.7rem;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text-muted, #475569);
    font-size: 0.87rem;
    font-weight: 700;
  }

  .conclusion-panel__group p {
    margin: 0;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.55;
    font-size: 0.88rem;
    overflow-wrap: anywhere;
  }

  @media (max-width: 760px) {
    .conclusion-panel__header {
      display: grid;
    }

    .conclusion-panel__metric {
      grid-template-columns: 1fr;
    }

    .conclusion-panel__metric dt {
      margin-bottom: 0.1rem;
    }
  }
`;
