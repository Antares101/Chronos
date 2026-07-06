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

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

function parseSnapshotDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const parsed = new Date(`${date}T00:00:00`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function formatSnapshotDate(date: string, snapshotDate: Date | null): string {
  if (!snapshotDate) return date;

  return dateFormatter.format(snapshotDate);
}

export default function TodayOperatingSummary({
  date,
  nowLabel,
  now,
  next,
  openTime,
}: TodayOperatingSummaryProps) {
  const snapshotDate = parseSnapshotDate(date);
  const isClockLabel = /^\d{1,2}:\d{2}(:\d{2})?$/.test(nowLabel);
  const snapshotDateTime = snapshotDate && isClockLabel ? `${date}T${nowLabel}` : undefined;
  const snapshotDateValue = snapshotDate ? date : undefined;
  const snapshotDateLabel = formatSnapshotDate(date, snapshotDate);

  return (
    <section className="today-now-board" aria-labelledby="today-now-board-title">
      <header className="today-now-board__header">
        <div className="today-now-board__title-group">
          <p className="today-now-board__eyebrow">Today · Now board</p>
          <h2 id="today-now-board-title">Current operating view</h2>
        </div>

        <div className="today-now-board__clock" aria-label="Current time snapshot">
          <span>Snapshot time</span>
          <time className="today-now-board__time" dateTime={snapshotDateTime}>
            {nowLabel}
          </time>
          <time className="today-now-board__date" dateTime={snapshotDateValue}>
            {snapshotDateLabel}
          </time>
        </div>
      </header>

      <div className="today-now-board__layout">
        <article className="today-now-board__now-card" aria-labelledby="today-now-title">
          <div className="today-now-board__card-header">
            <p>{now.label}</p>
            <strong className={`today-now-board__status today-now-board__status--${now.status}`}>
              {nowStatusLabels[now.status]}
            </strong>
          </div>
          <h3 id="today-now-title">{now.title}</h3>
          <span>{now.detail}</span>
        </article>

        <div className="today-now-board__side-cards" aria-label="Upcoming and open time">
          <article className="today-now-board__side-card">
            <p>{next.label}</p>
            <h3>{next.title}</h3>
            <span>{next.detail}</span>
          </article>

          <article className="today-now-board__side-card">
            <p>{openTime.label}</p>
            <h3>{openTime.title}</h3>
            <span>{openTime.detail}</span>
          </article>
        </div>
      </div>

      <style>{styles}</style>
    </section>
  );
}

const styles = `
  .today-now-board {
    min-width: 0;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background:
      radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--chronos-primary, #4f46e5) 12%, transparent), transparent 18rem),
      var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    overflow: hidden;
    padding: clamp(1rem, 2vw, 1.5rem);
  }

  .today-now-board,
  .today-now-board * {
    box-sizing: border-box;
  }

  .today-now-board__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: start;
    margin-bottom: 1rem;
    min-width: 0;
  }

  .today-now-board__title-group {
    min-width: 0;
  }

  .today-now-board__eyebrow,
  .today-now-board__card-header p,
  .today-now-board__side-card p {
    margin: 0;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .today-now-board h2,
  .today-now-board h3 {
    margin: 0;
    color: var(--chronos-text, #0f172a);
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .today-now-board h2 {
    margin-top: 0.25rem;
    font-size: clamp(1.35rem, 3vw, 2rem);
    line-height: 1.05;
  }

  .today-now-board__clock {
    display: grid;
    justify-items: end;
    gap: 0.15rem;
    min-width: 0;
    border: 1px solid var(--chronos-border-strong, rgba(99, 102, 241, 0.22));
    border-radius: 18px;
    background: var(--chronos-surface-tinted, #eef2ff);
    padding: 0.7rem 0.85rem;
    box-shadow: var(--chronos-shadow-soft, 0 14px 36px rgba(15, 23, 42, 0.08));
  }

  .today-now-board__clock span,
  .today-now-board__date {
    color: var(--chronos-text-muted, #475569);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .today-now-board__time {
    color: var(--chronos-primary-strong, #312e81);
    font-size: clamp(2.3rem, 6vw, 4.75rem);
    font-variant-numeric: tabular-nums;
    font-weight: 900;
    letter-spacing: -0.08em;
    line-height: 0.95;
  }

  .today-now-board__layout {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(min(100%, 18rem), 0.65fr);
    gap: 0.85rem;
    min-width: 0;
  }

  .today-now-board__now-card,
  .today-now-board__side-card {
    min-width: 0;
    overflow-wrap: anywhere;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    background: var(--chronos-surface-muted, #f1f5f9);
    color: var(--chronos-text, #0f172a);
  }

  .today-now-board__now-card {
    display: grid;
    align-content: space-between;
    gap: clamp(1.2rem, 2.4vw, 2rem);
    min-height: 15rem;
    border-radius: 22px;
    background:
      linear-gradient(135deg, var(--chronos-surface, #ffffff), var(--chronos-surface-tinted, #eef2ff));
    padding: clamp(1.1rem, 2.6vw, 1.6rem);
    box-shadow: var(--chronos-glow, 0 0 34px rgba(79, 70, 229, 0.2));
  }

  .today-now-board__card-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    min-width: 0;
  }

  .today-now-board__now-card h3 {
    max-width: 26rem;
    font-size: clamp(2rem, 5vw, 4.1rem);
    line-height: 0.95;
  }

  .today-now-board__now-card span,
  .today-now-board__side-card span {
    display: block;
    margin-top: 0.45rem;
    color: var(--chronos-text-muted, #475569);
    font-size: 0.92rem;
    font-weight: 700;
    line-height: 1.55;
  }

  .today-now-board__now-card > span {
    max-width: 34rem;
    font-size: clamp(1rem, 2vw, 1.1rem);
  }

  .today-now-board__status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 0.32rem 0.65rem;
    font-size: 0.74rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .today-now-board__status--running {
    background: var(--chronos-success-soft, #d1fae5);
    color: var(--chronos-success-text, #065f46);
  }

  .today-now-board__status--planned-now {
    background: var(--chronos-primary-soft, #e0e7ff);
    color: var(--chronos-primary-strong, #312e81);
  }

  .today-now-board__status--open-time {
    background: var(--chronos-sky-soft, #e0f2fe);
    color: var(--chronos-sky-text, #075985);
  }

  .today-now-board__status--review {
    background: var(--chronos-surface-muted, #f1f5f9);
    color: var(--chronos-text-muted, #475569);
  }

  .today-now-board__side-cards {
    display: grid;
    gap: 0.85rem;
    min-width: 0;
  }

  .today-now-board__side-card {
    border-radius: 18px;
    padding: 1rem;
  }

  .today-now-board__side-card h3 {
    margin-top: 0.35rem;
    font-size: clamp(1.1rem, 2vw, 1.45rem);
    line-height: 1.1;
  }

  @media (max-width: 820px) {
    .today-now-board__header,
    .today-now-board__layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .today-now-board__clock {
      justify-items: start;
      width: 100%;
    }

    .today-now-board__now-card {
      min-height: 12rem;
    }
  }

  @media (max-width: 520px) {
    .today-now-board {
      border-radius: 18px;
    }

    .today-now-board__side-cards {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (prefers-reduced-transparency: reduce), (prefers-reduced-data: reduce) {
    .today-now-board {
      background: var(--chronos-surface, #ffffff);
    }

    .today-now-board__now-card {
      box-shadow: none;
    }
  }
`;
