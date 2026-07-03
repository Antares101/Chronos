import type { BlockPhase, PauseKind } from '../../domain/models';
import { formatDurationMinutes } from '../schedule/time';

export type PauseControlsPause = {
  id: string;
  kind: PauseKind;
  startedAt: string;
  endedAt: string | null;
  note?: string | null;
};

export type PauseControlsProps = {
  eyebrow: string;
  title: string;
  description: string;
  blockPhase: BlockPhase;
  pauses: readonly PauseControlsPause[];
  blockId?: string;
  actionPath?: string;
};

const pauseButtonLabels: Record<PauseKind, string> = {
  '5m': 'Log 5-minute pause',
  '10m': 'Log 10-minute pause',
  untimed: 'Start untimed pause',
};

const pauseKindLabel: Record<PauseKind, string> = {
  '5m': '5m',
  '10m': '10m',
  untimed: 'untimed',
};

export default function PauseControls({
  eyebrow,
  title,
  description,
  blockPhase,
  pauses,
  blockId,
  actionPath,
}: PauseControlsProps) {
  const sortedPauses = [...pauses].sort(
    (first, second) => Date.parse(first.startedAt) - Date.parse(second.startedAt),
  );
  const canLogPause = blockPhase === 'execution';

  return (
    <section className="pause-controls" aria-labelledby="pause-controls-title">
      <header className="pause-controls__header">
        <div>
          <p className="pause-controls__eyebrow">{eyebrow}</p>
          <h3 id="pause-controls-title">{title}</h3>
          <p>{description}</p>
        </div>
        <span
          className={`pause-controls__state pause-controls__state--${
            canLogPause ? 'enabled' : 'disabled'
          }`}
        >
          {canLogPause ? 'Execution active' : 'Execution not active'}
        </span>
      </header>

      <p className="pause-controls__phase" aria-live="polite">
        {canLogPause
          ? 'Pause logging is available while the block is in execution.'
          : 'Pause logging is only available while block phase is execution.'}
      </p>

      <div className="pause-controls__actions" role="group" aria-label="Pause actions">
        {(Object.keys(pauseButtonLabels) as PauseKind[]).map((kind) =>
          actionPath && blockId ? (
            <form key={kind} method="post" action={actionPath}>
              <input type="hidden" name="action" value="log-pause" />
              <input type="hidden" name="blockId" value={blockId} />
              <input type="hidden" name="pauseKind" value={kind} />
              <button type="submit" disabled={!canLogPause} aria-label={pauseButtonLabels[kind]}>
                {pauseButtonLabels[kind]}
              </button>
            </form>
          ) : (
            <button
              key={kind}
              type="button"
              disabled={!canLogPause}
              aria-label={pauseButtonLabels[kind]}
            >
              {pauseButtonLabels[kind]}
            </button>
          ),
        )}
      </div>

      <h4 className="pause-controls__history-title">Recent pause entries</h4>
      {sortedPauses.length === 0 ? (
        <p className="pause-controls__empty">No pauses have been logged yet.</p>
      ) : (
        <ul role="list" className="pause-controls__history" aria-label="Pause history">
          {sortedPauses.map((pause) => {
            const endLabel = pause.endedAt
              ? formatPauseDuration(pause.startedAt, pause.endedAt)
              : 'open';
            const canEndPause =
              canLogPause &&
              pause.kind === 'untimed' &&
              pause.endedAt === null &&
              actionPath &&
              blockId;

            return (
              <li
                key={pause.id}
                className="pause-controls__history-item"
                aria-label={`${pauseKindLabel[pause.kind]} pause at ${pause.startedAt}`}
              >
                <span>
                  {pauseKindLabel[pause.kind].toUpperCase()} {pause.note ? `• ${pause.note}` : ''}
                </span>
                <span>{endLabel}</span>
                {canEndPause ? (
                  <form method="post" action={actionPath} className="pause-controls__end-form">
                    <input type="hidden" name="action" value="end-pause" />
                    <input type="hidden" name="blockId" value={blockId} />
                    <input type="hidden" name="pauseId" value={pause.id} />
                    <button
                      type="submit"
                      aria-label={`End untimed pause started at ${pause.startedAt}`}
                    >
                      End pause
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <style>{pauseControlsStyles}</style>
    </section>
  );
}

function formatPauseDuration(startedAt: string, endedAt: string): string {
  try {
    const durationMinutes = Math.max(
      0,
      Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 60_000),
    );

    return `${formatDurationMinutes(durationMinutes)}`;
  } catch {
    return 'duration unknown';
  }
}

const pauseControlsStyles = `
  .pause-controls {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
  }

  .pause-controls__header {
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

  .pause-controls__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .pause-controls h3 {
    margin: 0;
    font-size: clamp(1.15rem, 2.2vw, 1.8rem);
    letter-spacing: -0.03em;
  }

  .pause-controls__header p {
    margin: 0.35rem 0 0;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.5;
  }

  .pause-controls__state {
    flex: 0 0 auto;
    border-radius: 999px;
    font-size: 0.76rem;
    font-weight: 800;
    padding: 0.45rem 0.75rem;
  }

  .pause-controls__state--enabled {
    background: var(--chronos-success-soft, #d1fae5);
    color: var(--chronos-success-text, #065f46);
  }

  .pause-controls__state--disabled {
    background: var(--chronos-danger-soft, #fee2e2);
    color: var(--chronos-danger-text, #991b1b);
  }

  .pause-controls__phase {
    margin: 0.85rem 0 0;
    color: var(--chronos-text-muted, #475569);
    font-weight: 700;
    font-size: 0.87rem;
  }

  .pause-controls__actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.55rem;
    margin-top: 0.85rem;
  }

  .pause-controls__actions form {
    margin: 0;
  }

  .pause-controls button {
    appearance: none;
    border: 1px solid var(--chronos-border-strong, rgba(99, 102, 241, 0.22));
    border-radius: 14px;
    background: var(--chronos-primary-soft, #e0e7ff);
    color: var(--chronos-primary-strong, #312e81);
    padding: 0.65rem;
    min-height: 2.75rem;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
  }

  .pause-controls button:disabled {
    border-color: rgba(148, 163, 184, 0.4);
    background: var(--chronos-surface-muted, #f1f5f9);
    color: var(--chronos-text-soft, #64748b);
    cursor: not-allowed;
  }

  .pause-controls__history-title {
    margin: 1.1rem 0 0.45rem;
  }

  .pause-controls__empty {
    margin: 0.45rem 0 0;
    color: var(--chronos-text-soft, #64748b);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .pause-controls__history {
    list-style: none;
    display: grid;
    gap: 0.45rem;
    margin: 0;
    padding: 0;
  }

  .pause-controls__history-item {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 12px;
    padding: 0.55rem 0.7rem;
    display: flex;
    justify-content: space-between;
    background: var(--chronos-surface-muted, #f1f5f9);
    font-size: 0.83rem;
    gap: 0.75rem;
    color: var(--chronos-text-muted, #475569);
  }

  .pause-controls__history-item span:nth-of-type(2) {
    font-weight: 800;
    color: var(--chronos-primary, #4f46e5);
  }

  .pause-controls__end-form {
    margin: 0;
  }

  .pause-controls__end-form button {
    padding: 0.45rem 0.7rem;
  }

  @media (max-width: 760px) {
    .pause-controls__header {
      display: grid;
    }

    .pause-controls__actions {
      grid-template-columns: 1fr;
    }

    .pause-controls__history-item {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`;
