import type { CSSProperties } from 'react';

import type { BlockCategory } from '../../domain/models';
import { getCategoryTheme, orderedBlockCategories } from '../schedule/theme';
import {
  formatTimeLabel,
  getDurationLabel,
  getTimelineTicks,
  intervalToTimelineSpan,
} from '../schedule/time';

// Packing mirrors these CSS minimum heights so short blocks reserve their rendered space.
const WEEKLY_CALENDAR_LANE_MIN_HEIGHT_REM = 24.25;
const WEEKLY_CALENDAR_BLOCK_MIN_HEIGHT_REM = 3.2;

export type WeeklyCalendarEvent = {
  id: string;
  title: string;
};

export type WeeklyCalendarBlock = {
  id: string;
  title: string;
  category: BlockCategory;
  plannedStart: string;
  plannedEnd: string;
  highlightedEvents?: readonly WeeklyCalendarEvent[];
};

export type WeeklyCalendarDay = {
  date: string;
  label: string;
  blocks: readonly WeeklyCalendarBlock[];
};

export type WeeklyCalendarProps = {
  eyebrow: string;
  title: string;
  description: string;
  visibleStart: string;
  visibleEnd: string;
  days: readonly WeeklyCalendarDay[];
};

export default function WeeklyCalendar({
  eyebrow,
  title,
  description,
  visibleStart,
  visibleEnd,
  days,
}: WeeklyCalendarProps) {
  const ticks = getTimelineTicks(visibleStart, visibleEnd, 120);

  return (
    <section className="weekly-calendar" aria-labelledby="weekly-calendar-title">
      <header className="weekly-calendar__header">
        <div>
          <p className="weekly-calendar__eyebrow">{eyebrow}</p>
          <h2 id="weekly-calendar-title">{title}</h2>
          <p>{description}</p>
        </div>
        <span className="weekly-calendar__status">Week</span>
      </header>

      <div className="weekly-calendar__content">
        <aside className="weekly-calendar__legend" aria-label="Category legend">
          <h3>Legend</h3>
          <ul>
            {orderedBlockCategories.map((category) => {
              const theme = getCategoryTheme(category);

              return (
                <li key={category}>
                  <span style={{ backgroundColor: theme.marker }} aria-hidden="true" />
                  {theme.label}
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="weekly-calendar__board">
          <div className="weekly-calendar__time-axis" aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick.iso} style={{ top: `${tick.percent}%` }}>
                {tick.label}
              </span>
            ))}
          </div>

          <div className="weekly-calendar__days" role="list" aria-label="Weekly planned blocks">
            {days.map((day) => (
              <CalendarDay
                key={day.date}
                day={day}
                visibleStart={visibleStart}
                visibleEnd={visibleEnd}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{weeklyCalendarStyles}</style>
    </section>
  );
}

type CalendarDayProps = {
  day: WeeklyCalendarDay;
  visibleStart: string;
  visibleEnd: string;
};

function CalendarDay({ day, visibleStart, visibleEnd }: CalendarDayProps) {
  const dayVisibleStart = createDayBoundaryIso(day.date, visibleStart);
  const dayVisibleEnd = createDayBoundaryIso(day.date, visibleEnd);
  const packedBlocks = packWeeklyCalendarDayBlocks(day.blocks, dayVisibleStart, dayVisibleEnd);

  const isEmpty = day.blocks.length === 0;

  return (
    <article className="weekly-calendar__day" role="listitem" aria-label={`${day.label} schedule`}>
      <header>
        <span>{day.label}</span>
        <time dateTime={day.date}>{day.date.slice(5)}</time>
      </header>
      <div
        className={`weekly-calendar__lane${isEmpty ? ' weekly-calendar__lane--empty' : ''}`}
        data-empty={isEmpty}
      >
        {isEmpty ? <p>No blocks yet</p> : null}
        {packedBlocks.map((block) => (
          <CalendarBlock
            key={block.id}
            block={block}
            visibleStart={dayVisibleStart}
            visibleEnd={dayVisibleEnd}
          />
        ))}
      </div>
    </article>
  );
}

export type PackedWeeklyCalendarBlock = WeeklyCalendarBlock & {
  laneIndex: number;
  laneCount: number;
};

type TimedWeeklyCalendarBlock = {
  block: WeeklyCalendarBlock;
  startMs: number;
  endMs: number;
  renderedStartMs: number;
  renderedEndMs: number;
};

export function packWeeklyCalendarDayBlocks(
  blocks: readonly WeeklyCalendarBlock[],
  visibleStart: string,
  visibleEnd: string,
): PackedWeeklyCalendarBlock[] {
  const visibleStartMs = parseIsoTimestamp(visibleStart);
  const visibleEndMs = parseIsoTimestamp(visibleEnd);
  const minimumRenderedDurationMs = getMinimumRenderedBlockDurationMs(visibleStartMs, visibleEndMs);
  const timedBlocks = blocks
    .map((block) =>
      createTimedWeeklyCalendarBlock(block, {
        minimumRenderedDurationMs,
        visibleEndMs,
        visibleStartMs,
      }),
    )
    .sort(compareTimedBlocks);

  const packedBlocks: PackedWeeklyCalendarBlock[] = [];
  let overlapGroup: TimedWeeklyCalendarBlock[] = [];
  let overlapGroupEndMs = Number.NEGATIVE_INFINITY;

  for (const timedBlock of timedBlocks) {
    if (overlapGroup.length > 0 && timedBlock.renderedStartMs >= overlapGroupEndMs) {
      packedBlocks.push(...packOverlapGroup(overlapGroup));
      overlapGroup = [];
      overlapGroupEndMs = Number.NEGATIVE_INFINITY;
    }

    overlapGroup.push(timedBlock);
    overlapGroupEndMs = Math.max(overlapGroupEndMs, timedBlock.renderedEndMs);
  }

  if (overlapGroup.length > 0) {
    packedBlocks.push(...packOverlapGroup(overlapGroup));
  }

  return packedBlocks;
}

function compareTimedBlocks(first: TimedWeeklyCalendarBlock, second: TimedWeeklyCalendarBlock) {
  return (
    first.renderedStartMs - second.renderedStartMs ||
    first.startMs - second.startMs ||
    first.endMs - second.endMs ||
    first.block.title.localeCompare(second.block.title) ||
    first.block.id.localeCompare(second.block.id)
  );
}

type VisualPackingRange = {
  minimumRenderedDurationMs: number;
  visibleEndMs: number;
  visibleStartMs: number;
};

function createTimedWeeklyCalendarBlock(
  block: WeeklyCalendarBlock,
  { minimumRenderedDurationMs, visibleEndMs, visibleStartMs }: VisualPackingRange,
): TimedWeeklyCalendarBlock {
  const startMs = parseIsoTimestamp(block.plannedStart);
  const endMs = parseIsoTimestamp(block.plannedEnd);
  const renderedStartMs = Math.max(startMs, visibleStartMs);
  const renderedEndMs = Math.min(endMs, visibleEndMs);

  if (renderedEndMs <= renderedStartMs) {
    return {
      block,
      endMs,
      renderedEndMs: endMs,
      renderedStartMs: startMs,
      startMs,
    };
  }

  return {
    block,
    endMs,
    renderedEndMs: Math.max(renderedEndMs, renderedStartMs + minimumRenderedDurationMs),
    renderedStartMs,
    startMs,
  };
}

function getMinimumRenderedBlockDurationMs(visibleStartMs: number, visibleEndMs: number): number {
  const visibleDurationMs = visibleEndMs - visibleStartMs;

  if (visibleDurationMs <= 0) {
    throw new Error('Visible timeline end must be after start.');
  }

  return (
    visibleDurationMs * (WEEKLY_CALENDAR_BLOCK_MIN_HEIGHT_REM / WEEKLY_CALENDAR_LANE_MIN_HEIGHT_REM)
  );
}

function parseIsoTimestamp(value: string): number {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    throw new Error('Time values must be valid ISO date strings.');
  }

  return timestamp;
}

function packOverlapGroup(group: readonly TimedWeeklyCalendarBlock[]): PackedWeeklyCalendarBlock[] {
  const laneEndByIndex: number[] = [];
  const assignedBlocks = group.map((timedBlock) => {
    const availableLaneIndex = laneEndByIndex.findIndex(
      (laneEnd) => laneEnd <= timedBlock.renderedStartMs,
    );
    const laneIndex = availableLaneIndex === -1 ? laneEndByIndex.length : availableLaneIndex;
    laneEndByIndex[laneIndex] = timedBlock.renderedEndMs;

    return { block: timedBlock.block, laneIndex };
  });
  const laneCount = laneEndByIndex.length;

  return assignedBlocks.map(({ block, laneIndex }) => ({
    ...block,
    laneIndex,
    laneCount,
  }));
}

function createDayBoundaryIso(dayDate: string, timeSourceIso: string): string {
  return `${dayDate}T${timeSourceIso.slice(11)}`;
}

type CalendarBlockProps = {
  block: PackedWeeklyCalendarBlock;
  visibleStart: string;
  visibleEnd: string;
};

function CalendarBlock({ block, visibleStart, visibleEnd }: CalendarBlockProps) {
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
  const laneWidthPercent = 100 / block.laneCount;
  const style: CSSProperties = {
    top: `${span.leftPercent}%`,
    height: `${span.widthPercent}%`,
    left: `calc(0.35rem + ${block.laneIndex * laneWidthPercent}%)`,
    width: `calc(${laneWidthPercent}% - ${block.laneCount === 1 ? '0.7rem' : '0.47rem'})`,
    backgroundColor: theme.background,
    borderColor: theme.border,
    color: theme.text,
  };
  const timeRange = `${formatTimeLabel(block.plannedStart)} to ${formatTimeLabel(block.plannedEnd)}`;
  const duration = getDurationLabel(block.plannedStart, block.plannedEnd);

  return (
    <article
      className="weekly-calendar__block"
      style={style}
      aria-label={`${block.title}, ${theme.label}, planned ${timeRange}, ${duration}.`}
    >
      <span className="weekly-calendar__block-title">{block.title}</span>
      <span className="weekly-calendar__block-time">{timeRange}</span>
      {block.highlightedEvents?.map((event) => (
        <span
          key={event.id}
          className="weekly-calendar__event"
          aria-label={`Highlighted event: ${event.title}`}
        >
          ★ {event.title}
        </span>
      ))}
    </article>
  );
}

const weeklyCalendarStyles = `
  .weekly-calendar {
    min-width: 0;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
  }

  .weekly-calendar__header {
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

  .weekly-calendar__header > div {
    min-width: 0;
  }

  .weekly-calendar__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .weekly-calendar h2,
  .weekly-calendar h3 {
    margin: 0;
  }

  .weekly-calendar h2 {
    font-size: clamp(1.4rem, 3vw, 2rem);
    letter-spacing: -0.04em;
  }

  .weekly-calendar__header p {
    margin: 0.35rem 0 0;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.6;
  }

  .weekly-calendar__status {
    flex: 0 0 auto;
    border-radius: 999px;
    background: var(--chronos-primary-soft, #e0e7ff);
    color: var(--chronos-primary-strong, #312e81);
    font-size: 0.76rem;
    font-weight: 800;
    padding: 0.45rem 0.75rem;
  }

  .weekly-calendar__content {
    display: grid;
    grid-template-columns: minmax(10rem, 13rem) minmax(0, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }

  .weekly-calendar__legend {
    border-radius: 18px;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    background: var(--chronos-surface-muted, #f1f5f9);
    color: var(--chronos-text, #0f172a);
    padding: 1rem;
  }

  .weekly-calendar__legend h3 {
    font-size: 1rem;
  }

  .weekly-calendar__legend ul {
    display: grid;
    gap: 0.75rem;
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
  }

  .weekly-calendar__legend li {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    font-size: 0.88rem;
    font-weight: 700;
  }

  .weekly-calendar__legend li span {
    border-radius: 999px;
    height: 0.55rem;
    width: 0.55rem;
  }

  .weekly-calendar__board {
    display: grid;
    grid-template-columns: 3rem minmax(0, 1fr);
    gap: 0.75rem;
    min-width: 0;
  }

  .weekly-calendar__time-axis {
    position: relative;
    min-height: 27rem;
    color: var(--chronos-text-soft, #64748b);
    font-size: 0.72rem;
    font-weight: 700;
  }

  .weekly-calendar__time-axis span {
    position: absolute;
    right: 0;
    transform: translateY(-50%);
  }

  .weekly-calendar__time-axis span:first-child {
    transform: translateY(0);
  }

  .weekly-calendar__time-axis span:last-child {
    transform: translateY(-100%);
  }

  .weekly-calendar__days {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.5rem;
    min-width: 0;
  }

  .weekly-calendar__day {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
  }

  .weekly-calendar__day header {
    display: grid;
    gap: 0.15rem;
    min-height: 2.75rem;
    padding: 0.25rem;
  }

  .weekly-calendar__day header span {
    font-size: 0.78rem;
    font-weight: 850;
  }

  .weekly-calendar__day time {
    color: var(--chronos-text-soft, #64748b);
    font-size: 0.72rem;
  }

  .weekly-calendar__lane {
    position: relative;
    min-height: ${WEEKLY_CALENDAR_LANE_MIN_HEIGHT_REM}rem;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 16px;
    background:
      linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px) 0 0 / 100% 20%,
      var(--chronos-surface, #ffffff);
    overflow: hidden;
  }

  .weekly-calendar__lane > p {
    margin: 1rem 0.5rem;
    color: var(--chronos-text-soft, #64748b);
    font-size: 0.75rem;
    font-weight: 700;
    text-align: center;
  }

  .weekly-calendar__block {
    position: absolute;
    border: 1px solid;
    border-radius: 14px;
    box-sizing: border-box;
    min-height: ${WEEKLY_CALENDAR_BLOCK_MIN_HEIGHT_REM}rem;
    overflow: hidden;
    padding: 0.55rem;
  }

  .weekly-calendar__block-title,
  .weekly-calendar__block-time,
  .weekly-calendar__event {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .weekly-calendar__block-title {
    font-size: 0.78rem;
    font-weight: 850;
  }

  .weekly-calendar__block-time,
  .weekly-calendar__event {
    margin-top: 0.2rem;
    font-size: 0.66rem;
    font-weight: 700;
  }

  .weekly-calendar__event {
    color: var(--chronos-warning, #d97706);
  }

  @media (max-width: 980px) {
    .weekly-calendar__content {
      grid-template-columns: 1fr;
    }

    .weekly-calendar__board {
      grid-template-columns: 1fr;
    }

    .weekly-calendar__time-axis {
      display: none;
    }

    .weekly-calendar__days {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .weekly-calendar__lane--empty {
      min-height: 10rem;
    }
  }

  @media (max-width: 640px) {
    .weekly-calendar__lane--empty {
      min-height: 8rem;
    }

    .weekly-calendar__header {
      display: grid;
    }

    .weekly-calendar__days {
      grid-template-columns: 1fr;
    }
  }
`;
