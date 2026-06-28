export type TimelineSpan = {
  leftPercent: number;
  widthPercent: number;
  visible: boolean;
};

export type TimelineTick = {
  iso: string;
  label: string;
  percent: number;
};

export function timeToTimelinePercent(
  time: string,
  visibleStart: string,
  visibleEnd: string,
): number {
  const timeMs = parseIsoTime(time);
  const startMs = parseIsoTime(visibleStart);
  const endMs = parseIsoTime(visibleEnd);
  const durationMs = endMs - startMs;

  if (durationMs <= 0) {
    throw new Error('Visible timeline end must be after start.');
  }

  return clamp(((timeMs - startMs) / durationMs) * 100, 0, 100);
}

export function intervalToTimelineSpan(
  intervalStart: string,
  intervalEnd: string,
  visibleStart: string,
  visibleEnd: string,
): TimelineSpan {
  const startMs = parseIsoTime(intervalStart);
  const endMs = parseIsoTime(intervalEnd);
  const visibleStartMs = parseIsoTime(visibleStart);
  const visibleEndMs = parseIsoTime(visibleEnd);

  if (endMs < startMs) {
    throw new Error('Interval end must be after start.');
  }

  if (visibleEndMs <= visibleStartMs) {
    throw new Error('Visible timeline end must be after start.');
  }

  const clippedStartMs = Math.max(startMs, visibleStartMs);
  const clippedEndMs = Math.min(endMs, visibleEndMs);

  if (clippedEndMs <= clippedStartMs) {
    return {
      leftPercent: timeToTimelinePercent(intervalStart, visibleStart, visibleEnd),
      widthPercent: 0,
      visible: false,
    };
  }

  const visibleDurationMs = visibleEndMs - visibleStartMs;

  return {
    leftPercent: ((clippedStartMs - visibleStartMs) / visibleDurationMs) * 100,
    widthPercent: ((clippedEndMs - clippedStartMs) / visibleDurationMs) * 100,
    visible: true,
  };
}

export function getTimelineTicks(
  visibleStart: string,
  visibleEnd: string,
  stepMinutes: number,
): TimelineTick[] {
  const startMs = parseIsoTime(visibleStart);
  const endMs = parseIsoTime(visibleEnd);

  if (endMs <= startMs) {
    throw new Error('Visible timeline end must be after start.');
  }

  if (stepMinutes <= 0) {
    throw new Error('Timeline tick step must be positive.');
  }

  const stepMs = stepMinutes * 60_000;
  const ticks: TimelineTick[] = [];

  for (let tickMs = startMs; tickMs <= endMs; tickMs += stepMs) {
    const iso = new Date(tickMs).toISOString();
    ticks.push({
      iso,
      label: formatTimeLabel(iso),
      percent: timeToTimelinePercent(iso, visibleStart, visibleEnd),
    });
  }

  const lastTick = ticks.at(-1);
  const visibleEndLabel = formatTimeLabel(visibleEnd);

  if (!lastTick || lastTick.label !== visibleEndLabel) {
    ticks.push({
      iso: new Date(endMs).toISOString(),
      label: visibleEndLabel,
      percent: 100,
    });
  }

  return ticks;
}

export function getDurationLabel(start: string, end: string): string {
  return formatDurationMinutes(minutesBetween(start, end));
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function formatTimeLabel(iso: string): string {
  const date = new Date(parseIsoTime(iso));
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

function minutesBetween(start: string, end: string): number {
  const startMs = parseIsoTime(start);
  const endMs = parseIsoTime(end);

  if (endMs < startMs) {
    throw new Error('End time must be after start time.');
  }

  return Math.round((endMs - startMs) / 60_000);
}

function parseIsoTime(value: string): number {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    throw new Error('Time values must be valid ISO date strings.');
  }

  return timestamp;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
