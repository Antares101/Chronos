import type { BlockCategory, BlockPhase, TaskStatus } from '../../domain/models';
import { getDurationLabel, formatTimeLabel } from '../schedule/time';
import PauseControls, { type PauseControlsPause } from './PauseControls';

export type BlockDetailTask = {
  id: string;
  title: string;
  status: TaskStatus;
};

export type BlockDetailEvent = {
  id: string;
  title: string;
  note?: string;
};

export type BlockDetailProps = {
  eyebrow: string;
  title: string;
  description: string;
  block: {
    id: string;
    title: string;
    category: BlockCategory;
    phase: BlockPhase;
    plannedStart: string;
    plannedEnd: string;
  };
  tasks: readonly BlockDetailTask[];
  highlightedEvents: readonly BlockDetailEvent[];
  pauses: readonly PauseControlsPause[];
  pauseActionPath?: string;
};

const categoryLabelByCode: Record<BlockCategory, string> = {
  work: 'Work',
  home: 'Home',
  training: 'Training',
};

const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  done: 'Done',
};

export default function BlockDetail({
  eyebrow,
  title,
  description,
  block,
  tasks,
  highlightedEvents,
  pauses,
  pauseActionPath,
}: BlockDetailProps) {
  const sortedTasks = [...tasks].sort((first, second) => {
    if (first.status === second.status) {
      return 0;
    }

    return first.status === 'todo' ? -1 : 1;
  });

  const sortedEvents = [...highlightedEvents].sort((first, second) =>
    first.title.localeCompare(second.title),
  );
  const duration = getDurationLabel(block.plannedStart, block.plannedEnd);
  const timeRange = `${formatTimeLabel(block.plannedStart)} to ${formatTimeLabel(block.plannedEnd)}`;

  return (
    <section className="block-detail" aria-labelledby="block-detail-title">
      <header className="block-detail__header">
        <div>
          <p className="block-detail__eyebrow">{eyebrow}</p>
          <h2 id="block-detail-title">{title}</h2>
          <p>{description}</p>
        </div>
      </header>

      <article className="block-detail__context" aria-label="Active block context">
        <h3>{block.title}</h3>
        <p>
          {categoryLabelByCode[block.category]} · {block.phase} · {timeRange} · {duration}
        </p>
      </article>

      <section className="block-detail__group" aria-labelledby="block-detail-tasks-title">
        <h3 id="block-detail-tasks-title">Block tasks</h3>

        {sortedTasks.length === 0 ? (
          <p className="block-detail__empty">No tasks are attached to this block yet.</p>
        ) : null}

        {sortedTasks.length > 0 ? (
          <ul className="block-detail__tasks" role="list" aria-label="Tasks in active block">
            {sortedTasks.map((task) => (
              <li key={task.id} className={`block-detail__task block-detail__task--${task.status}`}>
                <span>{task.title}</span>
                <span>{taskStatusLabels[task.status]}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="block-detail__group" aria-labelledby="block-detail-events-title">
        <h3 id="block-detail-events-title">Highlighted events</h3>

        {sortedEvents.length === 0 ? (
          <p className="block-detail__empty">No highlighted events attached.</p>
        ) : null}

        {sortedEvents.length > 0 ? (
          <ul className="block-detail__events" role="list" aria-label="Highlighted block events">
            {sortedEvents.map((event) => (
              <li
                key={event.id}
                className="block-detail__event"
                aria-label={`Highlighted event: ${event.title}`}
              >
                <span>★ {event.title}</span>
                {event.note ? <small>{event.note}</small> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <PauseControls
        eyebrow="Active block interruptions"
        title="Pause controls"
        description="Log pause activity without moving planned block boundaries."
        blockPhase={block.phase}
        pauses={pauses}
        blockId={block.id}
        actionPath={pauseActionPath}
      />

      <style>{blockDetailStyles}</style>
    </section>
  );
}

const blockDetailStyles = `
  .block-detail {
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 24px;
    background: rgba(248, 250, 252, 0.96);
    color: #0f172a;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.16);
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
    display: grid;
    gap: 1rem;
  }

  .block-detail__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    border: 1px solid rgba(148, 163, 184, 0.26);
    border-radius: 18px;
    padding: 1rem;
    background: #ffffff;
  }

  .block-detail__eyebrow {
    margin: 0 0 0.25rem;
    color: #475569;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .block-detail h2 {
    margin: 0;
    font-size: clamp(1.25rem, 2.6vw, 1.8rem);
    letter-spacing: -0.03em;
  }

  .block-detail__header p {
    margin: 0.35rem 0 0;
    color: #475569;
    line-height: 1.5;
  }

  .block-detail__context {
    border: 1px solid rgba(148, 163, 184, 0.26);
    border-radius: 16px;
    padding: 0.8rem;
    background: #f8fafc;
  }

  .block-detail__context h3 {
    margin: 0;
  }

  .block-detail__context p {
    margin: 0.35rem 0 0;
    color: #334155;
    font-weight: 700;
    font-size: 0.87rem;
  }

  .block-detail__group {
    border: 1px solid rgba(148, 163, 184, 0.24);
    border-radius: 16px;
    padding: 0.85rem;
    background: #ffffff;
  }

  .block-detail__group h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }

  .block-detail__empty {
    margin: 0.35rem 0;
    color: #64748b;
    font-size: 0.86rem;
    font-weight: 700;
  }

  .block-detail__tasks,
  .block-detail__events {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.55rem;
  }

  .block-detail__task,
  .block-detail__event {
    display: flex;
    justify-content: space-between;
    gap: 0.7rem;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 12px;
    padding: 0.65rem 0.75rem;
    background: #f1f5f9;
    color: #334155;
  }

  .block-detail__task--done {
    opacity: 0.7;
    text-decoration: line-through;
  }

  .block-detail__task span:last-child,
  .block-detail__event span {
    font-size: 0.82rem;
    font-weight: 800;
    color: #166534;
    white-space: nowrap;
  }

  .block-detail__event small {
    margin-top: 0.15rem;
    color: #475569;
    font-size: 0.74rem;
    font-weight: 500;
    text-align: right;
  }

  .block-detail__event {
    align-items: baseline;
  }

  .block-detail__event span:first-child {
    color: #92400e;
  }

  .block-detail__event[aria-label] {
    margin: 0;
  }
`;
