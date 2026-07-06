export type TodayOperatingSummaryProps = {
  date: string;
  nowLabel: string;
  now: {
    label: 'Now';
    title: string;
    detail: string;
    status: 'running' | 'planned-now' | 'open-time' | 'review';
  };
  next: {
    label: 'Next';
    title: string;
    detail: string;
    blockId: string | null;
  };
  openTime: {
    label: 'Open time';
    title: string;
    detail: string;
    minutes: number | null;
  };
  currentBlockId: string | null;
  selectedBlockId: string | null;
};

const nowStatusLabels: Record<TodayOperatingSummaryProps['now']['status'], string> = {
  running: 'Running',
  'planned-now': 'Planned now',
  'open-time': 'Open',
  review: 'In review',
};

export default function TodayOperatingSummary({
  date,
  nowLabel,
  now,
  next,
  openTime,
}: TodayOperatingSummaryProps) {
  const cards = [now, next, openTime];

  return (
    <section className="today-summary" aria-labelledby="today-summary-title">
      <header className="today-summary__header">
        <div>
          <p className="today-summary__eyebrow">Today · {date}</p>
          <h2 id="today-summary-title">Operating summary</h2>
        </div>
        <span className="today-summary__time">Current time · {nowLabel}</span>
      </header>

      <div className="today-summary__grid">
        {cards.map((card) => (
          <article className="today-summary__card" key={card.label}>
            <p>{card.label}</p>
            <h3>{card.title}</h3>
            <span>{card.detail}</span>
            {card.label === 'Now' ? <strong>{nowStatusLabels[now.status]}</strong> : null}
          </article>
        ))}
      </div>

      <style>{styles}</style>
    </section>
  );
}

const styles = `
  .today-summary {
    min-width: 0;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    padding: clamp(1rem, 2vw, 1.5rem);
  }

  .today-summary__header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1rem;
    min-width: 0;
  }

  .today-summary__header > div {
    min-width: 0;
  }

  .today-summary__eyebrow,
  .today-summary__card p {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .today-summary h2,
  .today-summary h3 {
    margin: 0;
    letter-spacing: -0.03em;
  }

  .today-summary__time {
    border-radius: 999px;
    background: var(--chronos-primary-soft, #e0e7ff);
    color: var(--chronos-primary-strong, #312e81);
    font-size: 0.76rem;
    font-weight: 800;
    padding: 0.45rem 0.75rem;
  }

  .today-summary__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.8rem;
  }

  .today-summary__card {
    min-width: 0;
    overflow-wrap: anywhere;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 18px;
    background: var(--chronos-surface-muted, #f1f5f9);
    padding: 0.9rem;
  }

  .today-summary__card span {
    display: block;
    margin-top: 0.4rem;
    color: var(--chronos-text-muted, #475569);
    font-size: 0.86rem;
    line-height: 1.5;
  }

  .today-summary__card strong {
    display: inline-block;
    margin-top: 0.6rem;
    border-radius: 999px;
    background: var(--chronos-success-soft, #d1fae5);
    color: var(--chronos-success-text, #065f46);
    font-size: 0.72rem;
    padding: 0.25rem 0.5rem;
  }

  @media (max-width: 760px) {
    .today-summary__header,
    .today-summary__grid {
      display: grid;
      grid-template-columns: 1fr;
    }
  }
`;
