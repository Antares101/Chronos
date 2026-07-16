import type { TaskStatus } from '../../domain/models';
import type { DaySheetRow } from '../../domain/services/today-workspace';
import type { DailyTimelinePause } from '../timeline/DailyTimeline';
import { getCategoryTheme } from '../schedule/theme';
import { formatTimeLabel } from '../schedule/time';
import TodayBlockActions, { type TodayBlockAction } from './TodayBlockActions';
import TodayBlockTaskList from './TodayBlockTaskList';

export type TodayBlockDetail = {
  tasks: readonly { id: string; title: string; status: TaskStatus }[];
  highlightedEvents?: readonly { id: string; title: string }[];
  pauses: readonly DailyTimelinePause[];
  permittedActions: readonly TodayBlockAction[];
};
export type TodayBlockRowProps = {
  row: Extract<DaySheetRow, { kind: 'block' }>;
  detail: TodayBlockDetail | null;
  currentTime: string | null;
  actionPath: string;
};
const edgeLabels = {
  inside: null,
  'carry-in': 'Carry-in',
  'carry-out': 'Carries into tomorrow',
  spanning: 'Spans the full day',
} as const;
const lifecycleLabels = {
  planned: 'Planned',
  active: 'Active',
  paused: 'Paused',
  concluded: 'Concluded',
} as const;

export default function TodayBlockRow({
  row,
  detail,
  currentTime,
  actionPath,
}: TodayBlockRowProps) {
  const theme = getCategoryTheme(row.block.category);
  const edgeLabel = edgeLabels[row.edge];
  // prettier-ignore
  return <article className="today-block" data-category={row.block.category} data-overlap-depth={row.overlapDepth} data-assignment-target={row.block.id} data-assignment-target-label={row.block.title} aria-labelledby={`today-block-${row.block.id}`}><div className="today-block__time"><time dateTime={row.clippedStart}>{formatTimeLabel(row.clippedStart)}</time>{currentTime ? <span aria-current="time">Now · {formatTimeLabel(currentTime)}</span> : null}<span aria-hidden="true">—</span><time dateTime={row.clippedEnd}>{formatTimeLabel(row.clippedEnd)}</time></div><div className="today-block__surface"><header><div><p className="today-block__meta"><span>{theme.label}</span><span>{lifecycleLabels[row.lifecycle]}</span>{edgeLabel ? <span>{edgeLabel}</span> : null}{row.overlapDepth > 0 ? <span>Overlaps another block</span> : null}</p><h3 id={`today-block-${row.block.id}`}>{row.block.title}</h3></div></header>{detail ? <>{detail.tasks.length ? <TodayBlockTaskList actionPath={actionPath} blockTitle={row.block.title} tasks={detail.tasks} /> : <p className="today-block__empty">No tasks in this block.</p>}{detail.highlightedEvents?.length ? <ul className="today-block__events" aria-label={`Highlighted events for ${row.block.title}`}>{detail.highlightedEvents?.map((event) => <li key={event.id}>{event.title}</li>)}</ul> : null}{detail.pauses.length ? <ul className="today-block__pauses" aria-label={`Pauses for ${row.block.title}`}>{detail.pauses.map((pause) => <li key={pause.id}>Paused · {pause.kind === 'untimed' ? 'Untimed' : pause.kind} · {pause.endedAt ? 'Ended' : 'Open'}{pause.note ? ` · ${pause.note}` : ''}</li>)}</ul> : null}<TodayBlockActions actionPath={actionPath} block={row.block} actions={detail.permittedActions} /></> : <p className="today-block__empty" role="status">Block details are unavailable.</p>}</div></article>;
}
