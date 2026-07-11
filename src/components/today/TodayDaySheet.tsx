import type { DaySheetRow } from '../../domain/services/today-workspace';
import { formatTimeLabel } from '../schedule/time';
import TodayBlockRow, { type TodayBlockDetail } from './TodayBlockRow';

export type TodayDaySheetProps = {
  rows: readonly DaySheetRow[];
  currentTime: string | null;
  actionPath: string;
  blockDetails: Readonly<Record<string, TodayBlockDetail>>;
};

export default function TodayDaySheet({
  rows,
  currentTime,
  actionPath,
  blockDetails,
}: TodayDaySheetProps) {
  const blockCount = rows.filter((row) => row.kind === 'block').length;
  const entries = withCurrentMarker(rows, currentTime);
  // prettier-ignore
  return <section className="today-sheet" aria-labelledby="today-sheet-title"><header className="today-sheet__header"><p>Execution</p><h2 id="today-sheet-title">Day Sheet</h2><span>{blockCount} planned {blockCount === 1 ? 'block' : 'blocks'}</span></header>{blockCount === 0 ? <div className="today-sheet__available"><h3>No planned blocks</h3><p>The day is available from 00:00 to 24:00.</p><a href="/app/planning">Open Planning</a></div> : null}<ol className="today-sheet__list" aria-label="Chronological day sheet">{entries.map((entry) => <li key={entry.key} className={`today-sheet__item today-sheet__item--${entry.kind}`}>{entry.kind === 'current' ? <div className="today-sheet__now" aria-current="time">Now · {formatTimeLabel(entry.at)}</div> : entry.row.kind === 'gap' ? <GapRow row={entry.row} currentTime={entry.currentTime} /> : <TodayBlockRow row={entry.row} detail={blockDetails[entry.row.block.id] ?? null} currentTime={entry.currentTime} actionPath={actionPath} />}</li>)}</ol><style>{styles}</style></section>;
}

function GapRow({
  row,
  currentTime,
}: {
  row: Extract<DaySheetRow, { kind: 'gap' }>;
  currentTime: string | null;
}) {
  // prettier-ignore
  return <div className="today-sheet__gap"><span>Open time</span><span><time dateTime={row.start}>{formatTimeLabel(row.start)}</time>{currentTime ? <span aria-current="time">Now · {formatTimeLabel(currentTime)}</span> : null}–<time dateTime={row.end}>{formatTimeLabel(row.end)}</time></span></div>;
}

type Entry =
  | { kind: 'row'; key: string; row: DaySheetRow; currentTime: string | null }
  | { kind: 'current'; key: string; at: string };
function withCurrentMarker(rows: readonly DaySheetRow[], currentTime: string | null): Entry[] {
  const currentRow =
    currentTime &&
    rows.find(
      (row) =>
        Date.parse(row.kind === 'block' ? row.clippedStart : row.start) <=
          Date.parse(currentTime) &&
        Date.parse(currentTime) < Date.parse(row.kind === 'block' ? row.clippedEnd : row.end),
    );
  const entries: Entry[] = rows.map((row, index) => ({
    kind: 'row',
    key: `${row.kind}-${index}`,
    row,
    currentTime: row === currentRow ? currentTime : null,
  }));
  if (!currentTime || currentRow) return entries;
  const markerIndex = rows.findIndex(
    (row) =>
      Date.parse(row.kind === 'block' ? row.clippedStart : row.start) > Date.parse(currentTime),
  );
  entries.splice(markerIndex < 0 ? entries.length : markerIndex, 0, {
    kind: 'current',
    key: 'current-time',
    at: currentTime,
  });
  return entries;
}

const styles = `
.today-sheet{min-width:0;color:var(--chronos-text,var(--foreground,#0f172a));background:var(--chronos-surface,var(--card,#fff));border:1px solid var(--chronos-border,var(--border,rgba(99,102,241,.22)));border-radius:var(--radius,1rem);padding:clamp(1rem,2vw,1.5rem);overflow-wrap:anywhere}
.today-sheet *{box-sizing:border-box;min-width:0}.today-sheet__header{display:flex;align-items:baseline;gap:.75rem;flex-wrap:wrap}.today-sheet__header p,.today-sheet__header h2{margin:0}.today-sheet__header p{color:var(--chronos-primary,var(--primary,#4f46e5));font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.today-sheet__header h2{text-wrap:balance}.today-sheet__header span{margin-left:auto;color:var(--chronos-text-muted,var(--muted-foreground,#475569))}
.today-sheet__list{list-style:none;margin:1rem 0 0;padding:0 0 0:1.25rem;border-left:3px solid var(--chronos-primary,var(--primary,#4f46e5));display:grid;gap:.75rem}.today-sheet__item{position:relative}.today-sheet__item:before{content:"";position:absolute;left:-1.72rem;top:1rem;width:.75rem;height:.75rem;border-radius:50%;background:var(--chronos-sky,#0ea5e9);border:2px solid var(--chronos-surface,var(--card,#fff))}
.today-sheet__gap,.today-sheet__now,.today-sheet__available{border:1px dashed var(--chronos-border,var(--border,#cbd5e1));border-radius:.75rem;padding:.75rem;background:var(--chronos-surface-muted,var(--muted,#f1f5f9));display:flex;justify-content:space-between;gap:.75rem;flex-wrap:wrap}.today-sheet__now{color:var(--chronos-primary,var(--primary,#4f46e5));font-weight:800}.today-sheet__available{display:block;margin-top:1rem}.today-sheet__available h3,.today-sheet__available p{margin:0 0:.5rem}
.today-block{display:grid;grid-template-columns:minmax(5.5rem,auto) minmax(0,1fr);gap:.75rem}.today-block[data-overlap-depth]:not([data-overlap-depth="0"]){margin-left:clamp(.5rem,3vw,2rem)}.today-block__time{font-variant-numeric:tabular-nums;color:var(--chronos-text-muted,var(--muted-foreground,#475569));display:flex;gap:.25rem;flex-wrap:wrap}.today-block__surface{border:1px solid var(--chronos-border,var(--border,#cbd5e1));border-radius:.9rem;padding:.85rem;background:var(--chronos-surface,var(--card,#fff))}.today-block__surface h3{margin:.2rem 0 0;text-wrap:pretty}.today-block__meta{display:flex;gap:.4rem;flex-wrap:wrap;margin:0}.today-block__meta span{border-radius:999px;padding:.2rem .5rem;background:var(--chronos-primary-soft,#e0e7ff);font-size:.75rem;font-weight:800}.today-block__tasks,.today-block__pauses{padding-left:1.1rem}.today-block__tasks li{display:flex;justify-content:space-between;gap:.75rem}.today-block__empty,.today-block__no-actions{color:var(--chronos-text-muted,var(--muted-foreground,#475569))}
.today-block__actions summary{min-height:44px;padding:.65rem;border-radius:.65rem;cursor:pointer;font-weight:800;touch-action:manipulation}.today-block__actions summary:focus-visible,.today-block button:focus-visible,.today-sheet a:focus-visible,.today-block input:focus-visible,.today-block select:focus-visible,.today-block textarea:focus-visible{outline:3px solid var(--chronos-ring,var(--ring,#818cf8));outline-offset:2px}.today-block__action-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:.65rem}.today-block form{display:grid;align-content:start;gap:.45rem;border:1px solid var(--chronos-border,var(--border,#cbd5e1));border-radius:.75rem;padding:.65rem}.today-block label{display:grid;gap:.25rem}.today-block input,.today-block select,.today-block textarea,.today-block button{width:100%;max-width:100%;min-height:44px}.today-block fieldset{min-width:0;margin:0}.today-block fieldset label{display:flex;align-items:center}.today-block fieldset input{width:auto;min-height:auto}
@media(max-width:48rem){.today-block{grid-template-columns:1fr}.today-sheet__header span{margin-left:0;width:100%}.today-block__action-groups{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.today-sheet *{scroll-behavior:auto!important}}
`;
