import type { TaskStatus } from '../../domain/models';

export type TodayTaskPanelTask = {
  id: string;
  title: string;
  status: TaskStatus;
  placement: 'current-block' | 'today-block' | 'unassigned';
  blockId: string | null;
  blockTitle: string | null;
};

export type TodayTaskPanelProps = {
  title: string;
  description: string;
  currentBlockId: string | null;
  currentBlockTitle: string | null;
  actionPath: string;
  tasks: readonly TodayTaskPanelTask[];
};

const placementLabels: Record<TodayTaskPanelTask['placement'], string> = {
  'current-block': 'Current block',
  'today-block': 'Later today',
  unassigned: 'Open to place',
};

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  done: 'Done',
};

export default function TodayTaskPanel({
  title,
  description,
  currentBlockId,
  currentBlockTitle,
  actionPath,
  tasks,
}: TodayTaskPanelProps) {
  const groupedTasks = groupTasks(tasks);

  return (
    <section className="today-tasks" aria-labelledby="today-tasks-title">
      <header className="today-tasks__header">
        <p className="today-tasks__eyebrow">Tasks</p>
        <h2 id="today-tasks-title">{title}</h2>
        <p>{description}</p>
      </header>

      {(Object.keys(placementLabels) as TodayTaskPanelTask['placement'][]).map((placement) => (
        <section
          className="today-tasks__group"
          key={placement}
          aria-label={placementLabels[placement]}
        >
          <h3>{placementLabels[placement]}</h3>
          {groupedTasks[placement].length === 0 ? (
            <p className="today-tasks__empty">
              {placement === 'unassigned' ? 'No open tasks to place.' : 'No tasks here yet.'}
            </p>
          ) : null}
          <ul role="list">
            {groupedTasks[placement].map((task) => (
              <li key={task.id} className="today-tasks__task">
                <div className="today-tasks__task-content">
                  <span>{task.title}</span>
                  <small>
                    {statusLabels[task.status]}
                    {task.blockTitle ? ` · ${task.blockTitle}` : ''}
                  </small>
                </div>
                <div className="today-tasks__actions">
                  <form method="post" action={actionPath}>
                    <input type="hidden" name="action" value="today-set-task-status" />
                    <input type="hidden" name="taskId" value={task.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={task.status === 'todo' ? 'done' : 'todo'}
                    />
                    <button
                      type="submit"
                      aria-label={
                        task.status === 'todo'
                          ? `Mark ${task.title} done`
                          : `Mark ${task.title} to do`
                      }
                    >
                      {task.status === 'todo' ? 'Mark done' : 'Mark to do'}
                    </button>
                  </form>
                  {placement === 'unassigned' && task.status === 'todo' ? (
                    <form method="post" action={actionPath}>
                      <input type="hidden" name="action" value="assign-task" />
                      <input type="hidden" name="taskId" value={task.id} />
                      {currentBlockId ? (
                        <input type="hidden" name="blockId" value={currentBlockId} />
                      ) : null}
                      <button
                        type="submit"
                        disabled={!currentBlockId}
                        aria-label={
                          currentBlockTitle
                            ? `Add ${task.title} to ${currentBlockTitle}`
                            : `Add ${task.title} to current block`
                        }
                      >
                        Add to current block
                      </button>
                      {!currentBlockId ? <small>Start or create a block first.</small> : null}
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <style>{styles}</style>
    </section>
  );
}

function groupTasks(tasks: readonly TodayTaskPanelTask[]) {
  return tasks.reduce<Record<TodayTaskPanelTask['placement'], TodayTaskPanelTask[]>>(
    (groups, task) => {
      groups[task.placement].push(task);
      return groups;
    },
    { 'current-block': [], 'today-block': [], unassigned: [] },
  );
}

const styles = `
  .today-tasks {
    min-width: 0;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    padding: clamp(1rem, 2vw, 1.5rem);
  }

  .today-tasks__header,
  .today-tasks__group {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 18px;
    background: var(--chronos-surface-muted, #f1f5f9);
    padding: 1rem;
  }

  .today-tasks__header {
    background: var(--chronos-header-surface, linear-gradient(135deg, var(--chronos-surface, #ffffff), var(--chronos-surface-tinted, #eef2ff)));
  }

  .today-tasks__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .today-tasks h2,
  .today-tasks h3,
  .today-tasks p {
    margin: 0;
  }

  .today-tasks__header p {
    margin-top: 0.35rem;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.5;
  }

  .today-tasks__group {
    margin-top: 0.8rem;
  }

  .today-tasks ul {
    display: grid;
    gap: 0.55rem;
    list-style: none;
    margin: 0.65rem 0 0;
    padding: 0;
  }

  .today-tasks__task {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 14px;
    background: var(--chronos-surface, #ffffff);
    padding: 0.7rem;
  }

  .today-tasks__task-content {
    display: grid;
    gap: 0.15rem;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .today-tasks__actions {
    display: flex;
    align-items: center;
    flex: 0 1 auto;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.45rem;
    min-width: 0;
  }

  .today-tasks__task span {
    font-weight: 850;
  }

  .today-tasks small,
  .today-tasks__empty {
    color: var(--chronos-text-muted, #475569);
    font-size: 0.78rem;
    font-weight: 700;
  }

  .today-tasks form {
    display: grid;
    gap: 0.3rem;
    justify-items: end;
    margin: 0;
  }

  .today-tasks button {
    border: 1px solid var(--chronos-border-strong, rgba(99, 102, 241, 0.22));
    border-radius: 999px;
    background: var(--chronos-primary-soft, #e0e7ff);
    color: var(--chronos-primary-strong, #312e81);
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 850;
    padding: 0.5rem 0.75rem;
  }

  .today-tasks button:disabled {
    border-color: rgba(148, 163, 184, 0.4);
    background: var(--chronos-surface-muted, #f1f5f9);
    color: var(--chronos-text-soft, #64748b);
    cursor: not-allowed;
  }

  @media (max-width: 720px) {
    .today-tasks__task {
      align-items: stretch;
      flex-direction: column;
    }

    .today-tasks__actions {
      justify-content: flex-start;
    }

    .today-tasks form {
      justify-items: stretch;
    }
  }
`;
