import type { CSSProperties } from 'react';

import type { BlockCategory, BlockPhase, PauseKind } from '../../domain/models';
import { getCategoryTheme } from '../schedule/theme';
import {
  formatTimeLabel,
  getDurationLabel,
  getTimelineTicks,
  intervalToTimelineSpan,
  timeToTimelinePercent,
} from '../schedule/time';

export type DailyTimelineBlock = {
  id: string;
  title: string;
  category: BlockCategory;
  phase: BlockPhase;
  plannedStart: string;
  plannedEnd: string;
  note?: string;
};

export type DailyTimelinePause = {
  id: string;
  blockId: string;
  kind: PauseKind;
  startedAt: string;
  endedAt: string | null;
  note?: string;
};

export type DailyTimelineProps = {
  eyebrow: string;
  title: string;
  description: string;
  visibleStart: string;
  visibleEnd: string;
  currentTime: string | null;
  blocks: readonly DailyTimelineBlock[];
  pauses?: readonly DailyTimelinePause[];
};

const pauseKindLabels: Record<PauseKind, string> = {
  '5m': '5-minute pause',
  '10m': '10-minute pause',
  untimed: 'Untimed pause',
};

export default function DailyTimeline({
  eyebrow,
  title,
  description,
  visibleStart,
  visibleEnd,
  currentTime,
  blocks,
  pauses = [],
}: DailyTimelineProps) {
  const sortedBlocks = [...blocks].sort(
    (first, second) => Date.parse(first.plannedStart) - Date.parse(second.plannedStart),
  );
  const ticks = getTimelineTicks(visibleStart, visibleEnd, 120);
  const currentPercent = currentTime
    ? timeToTimelinePercent(currentTime, visibleStart, visibleEnd)
    : null;
  const trackLabel = currentTime
    ? `Daily timeline from ${formatTimeLabel(visibleStart)} to ${formatTimeLabel(
        visibleEnd,
      )}. Current time is ${formatTimeLabel(currentTime)}.`
    : `Daily timeline from ${formatTimeLabel(visibleStart)} to ${formatTimeLabel(
        visibleEnd,
      )}. No current time indicator for this date.`;

  return (
    <section className="daily-timeline" aria-labelledby="daily-timeline-title">
      <header className="daily-timeline__header">
        <div>
          <p className="daily-timeline__eyebrow">{eyebrow}</p>
          <h2 id="daily-timeline-title">{title}</h2>
          <p>{description}</p>
        </div>
        <span className="daily-timeline__status">Stored data</span>
      </header>

      <div className="daily-timeline__axis" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick.iso} style={{ left: `${tick.percent}%` }}>
            {tick.label}
          </span>
        ))}
      </div>

      <div className="daily-timeline__track" aria-label={trackLabel}>
        {currentTime && currentPercent !== null ? (
          <div
            className="daily-timeline__current"
            role="img"
            aria-label={`Current time indicator at ${formatTimeLabel(currentTime)}.`}
            style={{ left: `${currentPercent}%` }}
          >
            <span>Now</span>
          </div>
        ) : null}

        {sortedBlocks.length === 0 ? (
          <p className="daily-timeline__empty">
            No planned blocks yet. The time rail stays visible.
          </p>
        ) : null}

        {sortedBlocks.map((block) => (
          <TimelineBlock
            key={block.id}
            block={block}
            currentTime={currentTime}
            pauses={pauses.filter((pause) => pause.blockId === block.id)}
            visibleStart={visibleStart}
            visibleEnd={visibleEnd}
          />
        ))}
      </div>

      <div className="daily-timeline__notes" aria-label="Timeline notes">
        <p>Pauses are displayed inside their active block and do not move the planned schedule.</p>
        <p>Gaps stay visible so partially planned days still feel bounded.</p>
      </div>

      <style>{dailyTimelineStyles}</style>
    </section>
  );
}

type TimelineBlockProps = {
  block: DailyTimelineBlock;
  currentTime: string | null;
  pauses: readonly DailyTimelinePause[];
  visibleStart: string;
  visibleEnd: string;
};

function TimelineBlock({
  block,
  currentTime,
  pauses,
  visibleStart,
  visibleEnd,
}: TimelineBlockProps) {
  const span = intervalToTimelineSpan(
    block.plannedStart,
    block.plannedEnd,
    visibleStart,
    visibleEnd,
  );

  if (!span.visible) {
    return null;
  }

  const theme = getCategoryTheme(block.category);
  const style: CSSProperties = {
    left: `${span.leftPercent}%`,
    width: `${span.widthPercent}%`,
    backgroundColor: theme.background,
    borderColor: theme.border,
    color: theme.text,
  };
  const duration = getDurationLabel(block.plannedStart, block.plannedEnd);
  const timeRange = `${formatTimeLabel(block.plannedStart)} to ${formatTimeLabel(block.plannedEnd)}`;

  return (
    <article
      className={`daily-timeline__block daily-timeline__block--${block.phase}`}
      style={style}
      aria-label={`${block.title}, ${theme.label}, ${block.phase} phase, planned ${timeRange}, ${duration}.`}
    >
      <span className="daily-timeline__block-title">{block.title}</span>
      <span className="daily-timeline__block-meta">
        {theme.label} · {duration}
      </span>
      {block.note ? <span className="daily-timeline__block-note">{block.note}</span> : null}

      {pauses.length > 0 ? (
        <div
          className="daily-timeline__pause-lane"
          aria-label={`Pause segments recorded inside ${block.title}.`}
        >
          {pauses.map((pause) => (
            <PauseSegment key={pause.id} block={block} currentTime={currentTime} pause={pause} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

type PauseSegmentProps = {
  block: DailyTimelineBlock;
  currentTime: string | null;
  pause: DailyTimelinePause;
};

function PauseSegment({ block, currentTime, pause }: PauseSegmentProps) {
  const pauseEnd = pause.endedAt ?? currentTime;

  if (!pauseEnd) {
    return null;
  }

  const span = intervalToTimelineSpan(
    pause.startedAt,
    pauseEnd,
    block.plannedStart,
    block.plannedEnd,
  );

  if (!span.visible) {
    return null;
  }

  const style: CSSProperties = {
    left: `${span.leftPercent}%`,
    width: `${span.widthPercent}%`,
  };
  const label = pauseKindLabels[pause.kind];
  const timeRange = `${formatTimeLabel(pause.startedAt)} to ${formatTimeLabel(pauseEnd)}`;

  return (
    <span
      className="daily-timeline__pause-segment"
      style={style}
      aria-label={`${label} from ${timeRange} inside ${block.title}.${
        pause.note ? ` ${pause.note}` : ''
      }`}
    >
      {label}
    </span>
  );
}

const dailyTimelineStyles = `
  .daily-timeline {
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 24px;
    background: rgba(248, 250, 252, 0.96);
    color: #0f172a;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.16);
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
  }

  .daily-timeline__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    border: 1px solid rgba(148, 163, 184, 0.26);
    border-radius: 18px;
    padding: 1rem;
    background: #ffffff;
  }

  .daily-timeline__eyebrow {
    margin: 0 0 0.25rem;
    color: #475569;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .daily-timeline h2 {
    margin: 0;
    font-size: clamp(1.4rem, 3vw, 2rem);
    letter-spacing: -0.04em;
  }

  .daily-timeline__header p:last-child {
    margin: 0.35rem 0 0;
    color: #475569;
    line-height: 1.6;
  }

  .daily-timeline__status {
    flex: 0 0 auto;
    border-radius: 999px;
    background: #dcfce7;
    color: #166534;
    font-size: 0.76rem;
    font-weight: 800;
    padding: 0.45rem 0.75rem;
  }

  .daily-timeline__axis {
    position: relative;
    height: 2.5rem;
    margin: 1rem 0 0;
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 700;
  }

  .daily-timeline__axis span {
    position: absolute;
    top: 0.5rem;
    transform: translateX(-50%);
    white-space: nowrap;
  }

  .daily-timeline__axis span:first-child {
    transform: translateX(0);
  }

  .daily-timeline__axis span:last-child {
    transform: translateX(-100%);
  }

  .daily-timeline__track {
    position: relative;
    min-height: 12rem;
    border: 1px solid rgba(148, 163, 184, 0.28);
    border-radius: 20px;
    background:
      linear-gradient(90deg, rgba(148, 163, 184, 0.16) 1px, transparent 1px) 0 0 / 20% 100%,
      linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
    overflow: hidden;
  }

  .daily-timeline__current {
    position: absolute;
    inset-block: 0;
    z-index: 4;
    width: 2px;
    background: #0f172a;
    transform: translateX(-1px);
  }

  .daily-timeline__current span {
    position: absolute;
    top: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 999px;
    background: #0f172a;
    color: #ffffff;
    font-size: 0.68rem;
    font-weight: 800;
    padding: 0.25rem 0.45rem;
  }

  .daily-timeline__block {
    position: absolute;
    top: 3rem;
    min-height: 6.7rem;
    border: 1px solid;
    border-radius: 16px;
    padding: 0.8rem;
    overflow: hidden;
    box-sizing: border-box;
  }

  .daily-timeline__block--execution {
    box-shadow: inset 0 -4px 0 rgba(15, 118, 110, 0.16);
  }

  .daily-timeline__block-title,
  .daily-timeline__block-meta,
  .daily-timeline__block-note {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .daily-timeline__block-title {
    font-weight: 850;
  }

  .daily-timeline__block-meta,
  .daily-timeline__block-note {
    margin-top: 0.25rem;
    font-size: 0.75rem;
  }

  .daily-timeline__pause-lane {
    position: absolute;
    inset-inline: 0.65rem;
    bottom: 0.65rem;
    height: 1.35rem;
  }

  .daily-timeline__pause-segment {
    position: absolute;
    inset-block: 0;
    min-width: 1rem;
    border-radius: 999px;
    background: #fde68a;
    color: #92400e;
    font-size: 0.62rem;
    font-weight: 800;
    line-height: 1.35rem;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .daily-timeline__empty {
    margin: 5rem 1rem 0;
    color: #64748b;
    font-weight: 700;
    text-align: center;
  }

  .daily-timeline__notes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .daily-timeline__notes p {
    margin: 0;
    border-radius: 14px;
    background: #f1f5f9;
    color: #475569;
    font-size: 0.82rem;
    line-height: 1.5;
    padding: 0.85rem;
  }

  @media (max-width: 720px) {
    .daily-timeline__header,
    .daily-timeline__notes {
      grid-template-columns: 1fr;
    }

    .daily-timeline__header {
      display: grid;
    }

    .daily-timeline__axis {
      font-size: 0.7rem;
    }
  }
`;
