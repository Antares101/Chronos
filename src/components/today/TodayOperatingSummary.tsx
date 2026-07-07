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
    <section className="today-operating-strip" aria-labelledby="today-operating-strip-title">
      <header className="today-operating-strip__header">
        <div className="today-operating-strip__title-group">
          <p className="today-operating-strip__eyebrow">Operating strip</p>
          <h2 id="today-operating-strip-title">Now, next, and open space</h2>
        </div>

        <div className="today-operating-strip__utilities" aria-label="Current status and time">
          <div className="today-operating-strip__status-chip">
            <span>Current status</span>
            <strong
              className={`today-operating-strip__status today-operating-strip__status--${now.status}`}
            >
              {nowStatusLabels[now.status]}
            </strong>
          </div>
          <div className="today-operating-strip__clock" aria-label="Current time snapshot">
            <span>Clock</span>
            <time className="today-operating-strip__time" dateTime={snapshotDateTime}>
              {nowLabel}
            </time>
            <time className="today-operating-strip__date" dateTime={snapshotDateValue}>
              {snapshotDateLabel}
            </time>
          </div>
        </div>
      </header>

      <div className="today-operating-strip__signals" aria-label="Today operating signals">
        <article
          className="today-operating-strip__signal today-operating-strip__signal--focus"
          aria-labelledby="today-operating-now-title"
        >
          <p>{now.label}</p>
          <h3 id="today-operating-now-title">{now.title}</h3>
          <span>{now.detail}</span>
        </article>

        <article
          className="today-operating-strip__signal"
          aria-labelledby="today-operating-next-title"
        >
          <p>{next.label}</p>
          <h3 id="today-operating-next-title">{next.title}</h3>
          <span>{next.detail}</span>
        </article>

        <article
          className="today-operating-strip__signal"
          aria-labelledby="today-operating-open-title"
        >
          <p>{openTime.label}</p>
          <h3 id="today-operating-open-title">{openTime.title}</h3>
          <span>{openTime.detail}</span>
        </article>
      </div>

      <style>{styles}</style>
    </section>
  );
}

const styles = `
  .today-operating-strip {
    position: relative;
    min-width: 0;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 22px;
    background:
      radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--chronos-primary, #4f46e5) 10%, transparent), transparent 18rem),
      linear-gradient(135deg, var(--chronos-surface, #ffffff), var(--chronos-surface-tinted, #eef2ff));
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    overflow: hidden;
    padding: clamp(0.85rem, 1.6vw, 1.15rem);
  }

  .today-operating-strip,
  .today-operating-strip * {
    box-sizing: border-box;
  }

  .today-operating-strip__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: clamp(0.75rem, 1.4vw, 1rem);
    align-items: center;
    min-width: 0;
  }

  .today-operating-strip__title-group {
    min-width: 0;
  }

  .today-operating-strip__eyebrow,
  .today-operating-strip__signal p,
  .today-operating-strip__clock span,
  .today-operating-strip__status-chip span {
    margin: 0;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.7rem;
    font-weight: 850;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .today-operating-strip h2,
  .today-operating-strip h3 {
    margin: 0;
    color: var(--chronos-text, #0f172a);
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .today-operating-strip h2 {
    margin-top: 0.18rem;
    font-size: clamp(1.25rem, 1.8vw, 1.75rem);
    line-height: 1.08;
  }

  .today-operating-strip__utilities {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    justify-self: end;
    gap: 0.45rem;
    max-width: min(100%, 26rem);
    min-width: 0;
    border: 1px solid color-mix(in srgb, var(--chronos-border-strong, rgba(99, 102, 241, 0.22)) 82%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--chronos-surface, #ffffff) 78%, transparent);
    padding: 0.35rem;
    box-shadow: var(--chronos-shadow-soft, 0 14px 36px rgba(15, 23, 42, 0.08));
    backdrop-filter: blur(14px);
  }

  .today-operating-strip__status-chip,
  .today-operating-strip__clock {
    display: grid;
    align-content: center;
    min-width: 0;
    border: 1px solid var(--chronos-border-strong, rgba(99, 102, 241, 0.22));
    border-radius: 999px;
    background: color-mix(in srgb, var(--chronos-surface, #ffffff) 86%, transparent);
    padding: 0.42rem 0.68rem;
  }

  .today-operating-strip__status-chip {
    gap: 0.18rem;
  }

  .today-operating-strip__clock {
    grid-template-columns: auto auto;
    column-gap: 0.55rem;
    row-gap: 0.05rem;
    align-items: baseline;
  }

  .today-operating-strip__clock span {
    grid-column: 1 / -1;
    color: var(--chronos-text-muted, #475569);
  }

  .today-operating-strip__time {
    color: var(--chronos-primary-strong, #312e81);
    font-size: clamp(1.15rem, 2.2vw, 1.55rem);
    font-variant-numeric: tabular-nums;
    font-weight: 900;
    letter-spacing: -0.06em;
    line-height: 0.95;
  }

  .today-operating-strip__date {
    color: var(--chronos-text-muted, #475569);
    font-size: 0.76rem;
    font-weight: 850;
    white-space: nowrap;
  }

  .today-operating-strip__status {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    border-radius: 999px;
    padding: 0.24rem 0.55rem;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .today-operating-strip__status--running {
    background: var(--chronos-success-soft, #d1fae5);
    color: var(--chronos-success-text, #065f46);
  }

  .today-operating-strip__status--planned-now {
    background: var(--chronos-primary-soft, #e0e7ff);
    color: var(--chronos-primary-strong, #312e81);
  }

  .today-operating-strip__status--open-time {
    background: var(--chronos-sky-soft, #e0f2fe);
    color: var(--chronos-sky-text, #075985);
  }

  .today-operating-strip__status--review {
    background: var(--chronos-surface-muted, #f1f5f9);
    color: var(--chronos-text-muted, #475569);
  }

  .today-operating-strip__signals {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: 0.65rem;
    width: 100%;
    max-width: 78rem;
    margin-top: 0.8rem;
    min-width: 0;
  }

  .today-operating-strip__signal {
    min-width: 0;
    max-width: 100%;
    overflow-wrap: anywhere;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 16px;
    background: color-mix(in srgb, var(--chronos-surface, #ffffff) 88%, transparent);
    padding: clamp(0.75rem, 1.4vw, 0.95rem);
  }

  .today-operating-strip__signal--focus {
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--chronos-primary-soft, #e0e7ff) 62%, var(--chronos-surface, #ffffff)), var(--chronos-surface, #ffffff));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--chronos-primary, #4f46e5) 12%, transparent);
  }

  .today-operating-strip__signal h3 {
    margin-top: 0.3rem;
    font-size: clamp(1.05rem, 1.7vw, 1.4rem);
    line-height: 1.08;
  }

  .today-operating-strip__signal span {
    display: block;
    margin-top: 0.28rem;
    color: var(--chronos-text-muted, #475569);
    font-size: 0.86rem;
    font-weight: 750;
    line-height: 1.45;
  }

  @media (min-width: 72rem) {
    .today-operating-strip__signals {
      grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.92fr) minmax(0, 0.9fr);
    }
  }

  @media (max-width: 760px) {
    .today-operating-strip__header,
    .today-operating-strip__signals {
      grid-template-columns: minmax(0, 1fr);
    }

    .today-operating-strip__utilities {
      justify-content: flex-start;
      justify-self: start;
      max-width: 100%;
      border-radius: 18px;
    }
  }

  @media (max-width: 520px) {
    .today-operating-strip {
      border-radius: 18px;
    }

    .today-operating-strip__utilities,
    .today-operating-strip__status-chip,
    .today-operating-strip__clock {
      width: 100%;
    }

    .today-operating-strip__clock {
      border-radius: 16px;
    }
  }

  @media (prefers-reduced-transparency: reduce), (prefers-reduced-data: reduce) {
    .today-operating-strip,
    .today-operating-strip__utilities,
    .today-operating-strip__signal--focus {
      background: var(--chronos-surface, #ffffff);
    }

    .today-operating-strip__utilities {
      backdrop-filter: none;
    }
  }
`;
