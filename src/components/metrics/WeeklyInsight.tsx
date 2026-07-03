import type { BlockCategory } from '../../domain/models';
import type { PlannedVsActualSummary } from '../../domain/services/metrics';

export type WeeklyInsightProps = {
  eyebrow: string;
  title: string;
  description: string;
  summary: PlannedVsActualSummary;
};

const categoryLabelByCode: Record<BlockCategory, string> = {
  work: 'Work',
  home: 'Home',
  training: 'Training',
};

const categoryStyleByCode: Record<BlockCategory, string> = {
  work: 'var(--chronos-primary, #4f46e5)',
  home: 'var(--chronos-sky, #0ea5e9)',
  training: 'var(--chronos-success, #059669)',
};

export default function WeeklyInsight({
  eyebrow,
  title,
  description,
  summary,
}: WeeklyInsightProps) {
  const categories = Object.entries(summary.byCategory);
  const phases = Object.entries(summary.byPhase);
  const blocks = Object.entries(summary.byBlock);

  const allBlocksSorted = blocks.sort((first, second) => first[0].localeCompare(second[0]));

  return (
    <section className="weekly-insight" aria-labelledby="weekly-insight-title">
      <header className="weekly-insight__header">
        <div>
          <p className="weekly-insight__eyebrow">{eyebrow}</p>
          <h2 id="weekly-insight-title">{title}</h2>
          <p>{description}</p>
        </div>
      </header>

      <div className="weekly-insight__grids">
        <article className="weekly-insight__panel" aria-label="Planned vs actual by category">
          <h3>By category</h3>
          <ul role="list" className="weekly-insight__metric-list">
            {categories.map(([category, value]) => (
              <li
                key={category}
                className="weekly-insight__metric-item"
                aria-label={`Category ${categoryLabelByCode[category as BlockCategory]}`}
              >
                <span className="weekly-insight__metric-name">
                  {categoryLabelByCode[category as BlockCategory]}
                </span>
                <span
                  className="weekly-insight__metric-dim"
                  style={{
                    borderLeft: `2px solid ${categoryStyleByCode[category as BlockCategory]}`,
                    paddingLeft: '0.45rem',
                  }}
                >
                  planned {value.plannedMinutes}m
                </span>
                <span>actual {value.actualMinutes}m</span>
                <strong
                  className={
                    value.deltaMinutes >= 0
                      ? 'weekly-insight__metric-delta--up'
                      : 'weekly-insight__metric-delta--down'
                  }
                >
                  {value.deltaMinutes >= 0 ? '+' : ''}
                  {value.deltaMinutes}m
                </strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="weekly-insight__panel" aria-label="Planned vs actual by phase">
          <h3>By phase</h3>
          <ul role="list" className="weekly-insight__metric-list">
            {phases.map(([phase, value]) => (
              <li key={phase} className="weekly-insight__metric-item" aria-label={`Phase ${phase}`}>
                <span className="weekly-insight__metric-name">{phase}</span>
                <span className="weekly-insight__metric-dim">planned {value.plannedMinutes}m</span>
                <span>actual {value.actualMinutes}m</span>
                <strong
                  className={
                    value.deltaMinutes >= 0
                      ? 'weekly-insight__metric-delta--up'
                      : 'weekly-insight__metric-delta--down'
                  }
                >
                  {value.deltaMinutes >= 0 ? '+' : ''}
                  {value.deltaMinutes}m
                </strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="weekly-insight__panel" aria-label="Planned vs actual by block">
        <h3>By block</h3>
        {allBlocksSorted.length === 0 ? (
          <p className="weekly-insight__empty">No block metrics yet.</p>
        ) : (
          <ul role="list" className="weekly-insight__metric-list">
            {allBlocksSorted.map(([blockId, value]) => (
              <li
                key={blockId}
                className="weekly-insight__metric-item"
                aria-label={`Block ${blockId}`}
              >
                <span className="weekly-insight__metric-name">{value.key}</span>
                <span className="weekly-insight__metric-dim">planned {value.plannedMinutes}m</span>
                <span>actual {value.actualMinutes}m</span>
                <strong
                  className={
                    value.deltaMinutes >= 0
                      ? 'weekly-insight__metric-delta--up'
                      : 'weekly-insight__metric-delta--down'
                  }
                >
                  {value.deltaMinutes >= 0 ? '+' : ''}
                  {value.deltaMinutes}m
                </strong>
              </li>
            ))}
          </ul>
        )}
      </article>

      <style>{weeklyInsightStyles}</style>
    </section>
  );
}

const weeklyInsightStyles = `
  .weekly-insight {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
  }

  .weekly-insight__header {
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
  }

  .weekly-insight__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .weekly-insight h2 {
    margin: 0;
    font-size: clamp(1.25rem, 2.6vw, 1.8rem);
    letter-spacing: -0.03em;
  }

  .weekly-insight__header p {
    margin: 0.35rem 0 0;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.5;
  }

  .weekly-insight__grids {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }

  .weekly-insight__panel {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 16px;
    padding: 0.85rem;
    background: var(--chronos-surface-muted, #f1f5f9);
  }

  .weekly-insight__panel h3 {
    margin: 0 0 0.6rem;
    font-size: 1rem;
  }

  .weekly-insight__metric-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }

  .weekly-insight__metric-item {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 12px;
    padding: 0.6rem 0.7rem;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text-muted, #475569);
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr auto;
    gap: 0.6rem;
    align-items: center;
    font-size: 0.85rem;
  }

  .weekly-insight__metric-name {
    font-weight: 800;
    color: var(--chronos-text, #0f172a);
    text-transform: capitalize;
  }

  .weekly-insight__metric-dim {
    color: var(--chronos-text-muted, #475569);
    white-space: nowrap;
    font-weight: 700;
  }

  .weekly-insight__metric-delta--up {
    color: var(--chronos-success-text, #065f46);
    font-weight: 800;
  }

  .weekly-insight__metric-delta--down {
    color: var(--chronos-danger-text, #991b1b);
    font-weight: 800;
  }

  .weekly-insight__empty {
    margin: 0;
    color: var(--chronos-text-soft, #64748b);
    font-size: 0.86rem;
    font-weight: 700;
  }

  @media (max-width: 760px) {
    .weekly-insight__grids {
      grid-template-columns: minmax(0, 1fr);
    }

    .weekly-insight__metric-item {
      display: grid;
      grid-template-columns: 1fr;
    }
  }
`;
