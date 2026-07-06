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
  displayStart?: string;
  displayEnd?: string;
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
  const offWindowBlocks = sortedBlocks.filter(
    (block) => !isBlockVisibleInWindow(block, visibleStart, visibleEnd),
  );
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
        <span className="daily-timeline__status">Today</span>
      </header>

      <div className="daily-timeline__axis" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick.iso} style={{ left: `${tick.percent}%` }}>
            {tick.label}
          </span>
        ))}
      </div>

      {offWindowBlocks.length > 0 ? (
        <div
          className="daily-timeline__off-window"
          aria-label="Blocks outside this timeline window"
        >
          <span>Blocks outside this timeline window</span>
          <ul>
            {offWindowBlocks.map((block) => (
              <li key={block.id}>{getOffWindowBlockLabel(block, visibleStart)}</li>
            ))}
          </ul>
        </div>
      ) : null}

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
          <p className="daily-timeline__empty">No blocks planned for today yet.</p>
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
        <p>Pauses stay inside the block where they happened.</p>
        <p>Open gaps show where the day still has room.</p>
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
  const blockStart = getBlockDisplayStart(block);
  const blockEnd = getBlockDisplayEnd(block);
  const span = intervalToTimelineSpan(blockStart, blockEnd, visibleStart, visibleEnd);

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
  const displayTimeRange = `${formatTimeLabel(blockStart)} to ${formatTimeLabel(blockEnd)}`;
  const displayDetail =
    blockStart !== block.plannedStart || blockEnd !== block.plannedEnd
      ? ` Shown in this window from ${displayTimeRange}.`
      : '';
  const temporalState = getBlockTemporalState(block, currentTime, blockStart);

  return (
    <article
      className={`daily-timeline__block daily-timeline__block--${block.phase} daily-timeline__block--${temporalState}`}
      style={style}
      aria-label={`${block.title}, ${theme.label}, ${block.phase} phase, ${temporalState} block, planned ${timeRange}, ${duration}.${displayDetail}`}
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
            <PauseSegment
              key={pause.id}
              block={block}
              blockEnd={blockEnd}
              blockStart={blockStart}
              currentTime={currentTime}
              pause={pause}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

type PauseSegmentProps = {
  block: DailyTimelineBlock;
  blockStart: string;
  blockEnd: string;
  currentTime: string | null;
  pause: DailyTimelinePause;
};

function getBlockDisplayStart(block: DailyTimelineBlock): string {
  return block.displayStart ?? block.plannedStart;
}

function getBlockDisplayEnd(block: DailyTimelineBlock): string {
  return block.displayEnd ?? block.plannedEnd;
}

function isBlockVisibleInWindow(
  block: DailyTimelineBlock,
  visibleStart: string,
  visibleEnd: string,
): boolean {
  return intervalToTimelineSpan(
    getBlockDisplayStart(block),
    getBlockDisplayEnd(block),
    visibleStart,
    visibleEnd,
  ).visible;
}

function getOffWindowBlockLabel(block: DailyTimelineBlock, visibleStart: string): string {
  const blockStart = getBlockDisplayStart(block);
  const blockEnd = getBlockDisplayEnd(block);
  const position =
    Date.parse(blockEnd) <= Date.parse(visibleStart) ? 'Before window' : 'After window';

  return `${position}: ${block.title}, ${formatTimeLabel(blockStart)} to ${formatTimeLabel(blockEnd)}`;
}

function getBlockTemporalState(
  block: DailyTimelineBlock,
  currentTime: string | null,
  blockStart: string,
): 'past' | 'current' | 'upcoming' {
  if (!currentTime) {
    return 'upcoming';
  }

  const currentMs = Date.parse(currentTime);
  const startMs = Date.parse(blockStart);
  const endMs = Date.parse(block.plannedEnd);

  if (block.phase === 'conclusion') {
    return 'past';
  }

  if (block.phase === 'execution') {
    return 'current';
  }

  if (currentMs >= startMs && currentMs < endMs) {
    return 'current';
  }

  return endMs <= currentMs ? 'past' : 'upcoming';
}

function PauseSegment({ block, blockEnd, blockStart, currentTime, pause }: PauseSegmentProps) {
  const pauseEnd = pause.endedAt ?? currentTime;

  if (!pauseEnd) {
    return null;
  }

  const span = intervalToTimelineSpan(pause.startedAt, pauseEnd, blockStart, blockEnd);

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
    min-width: 0;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
  }

  .daily-timeline__header {
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

  .daily-timeline__header > div {
    min-width: 0;
  }

  .daily-timeline__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
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
    color: var(--chronos-text-muted, #475569);
    line-height: 1.6;
  }

  .daily-timeline__status {
    flex: 0 0 auto;
    border-radius: 999px;
    background: var(--chronos-success-soft, #d1fae5);
    color: var(--chronos-success-text, #065f46);
    font-size: 0.76rem;
    font-weight: 800;
    padding: 0.45rem 0.75rem;
  }

  .daily-timeline__axis {
    position: relative;
    height: 2.5rem;
    margin: 1rem 0 0;
    color: var(--chronos-text-soft, #64748b);
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

  .daily-timeline__off-window {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin: 0 0 0.75rem;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 16px;
    background: var(--chronos-surface-muted, #f1f5f9);
    color: var(--chronos-text-muted, #475569);
    font-size: 0.78rem;
    padding: 0.7rem 0.85rem;
  }

  .daily-timeline__off-window > span {
    color: var(--chronos-primary, #4f46e5);
    font-weight: 850;
  }

  .daily-timeline__off-window ul {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .daily-timeline__off-window li {
    border-radius: 999px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    font-weight: 750;
    padding: 0.3rem 0.55rem;
  }

  .daily-timeline__track {
    position: relative;
    min-height: 12rem;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 20px;
    background:
      linear-gradient(90deg, rgba(148, 163, 184, 0.16) 1px, transparent 1px) 0 0 / 20% 100%,
      linear-gradient(135deg, var(--chronos-bg, #f8fafc) 0%, var(--chronos-surface-tinted, #eef2ff) 100%);
    overflow: hidden;
  }

  .daily-timeline__current {
    position: absolute;
    inset-block: 0;
    z-index: 4;
    width: 2px;
    background: var(--chronos-primary, #4f46e5);
    transform: translateX(-1px);
  }

  .daily-timeline__current span {
    position: absolute;
    top: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 999px;
    background: var(--chronos-primary, #4f46e5);
    color: var(--chronos-button-text, #ffffff);
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

  .daily-timeline__block--execution,
  .daily-timeline__block--current {
    box-shadow: inset 0 -4px 0 rgba(79, 70, 229, 0.18), 0 0 0 2px rgba(79, 70, 229, 0.18);
  }

  .daily-timeline__block--past {
    filter: saturate(0.7);
    opacity: 0.58;
  }

  .daily-timeline__block--upcoming {
    opacity: 0.94;
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
    background: var(--chronos-warning-soft, #fef3c7);
    color: var(--chronos-warning-text, #92400e);
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
    color: var(--chronos-text-soft, #64748b);
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
    background: var(--chronos-surface-muted, #f1f5f9);
    color: var(--chronos-text-muted, #475569);
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

  @media (max-width: 900px) {
    .daily-timeline__axis span:nth-child(even) {
      display: none;
    }

    .daily-timeline__axis span:first-child,
    .daily-timeline__axis span:last-child {
      display: block;
    }
  }

  @media (max-width: 520px) {
    .daily-timeline__axis {
      height: 2.25rem;
      font-size: 0.68rem;
    }

    .daily-timeline__axis span {
      display: none;
    }

    .daily-timeline__axis span:nth-child(3n + 1),
    .daily-timeline__axis span:first-child,
    .daily-timeline__axis span:last-child {
      display: block;
    }
  }
`;
