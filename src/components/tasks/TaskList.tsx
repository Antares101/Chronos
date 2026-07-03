import type { TaskStatus } from '../../domain/models';

export type TaskListTask = {
  id: string;
  title: string;
  status: TaskStatus;
};

export type TaskListProps = {
  eyebrow: string;
  title: string;
  description: string;
  tasks: readonly TaskListTask[];
};

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  done: 'Done',
};

export default function TaskList({ eyebrow, title, description, tasks }: TaskListProps) {
  const sortedTasks = [...tasks].sort((first, second) => {
    if (first.status === second.status) {
      return 0;
    }

    return first.status === 'todo' ? -1 : 1;
  });

  const todoCount = tasks.filter((task) => task.status === 'todo').length;

  return (
    <section className="task-list" aria-labelledby="task-list-title">
      <header className="task-list__header">
        <div>
          <p className="task-list__eyebrow">{eyebrow}</p>
          <h2 id="task-list-title">{title}</h2>
          <p>{description}</p>
        </div>
        <span className="task-list__status">{todoCount} unassigned tasks</span>
      </header>

      <div className="task-list__content">
        {sortedTasks.length === 0 ? (
          <p className="task-list__empty" aria-live="polite">
            No general tasks are waiting in the backlog.
          </p>
        ) : null}

        {sortedTasks.length > 0 ? (
          <ul className="task-list__items" role="list" aria-label="General task backlog">
            {sortedTasks.map((task) => (
              <li
                key={task.id}
                className={`task-list__item task-list__item--${task.status}`}
                aria-label={`Task ${task.title}, status ${statusLabels[task.status]}`}
              >
                <span className="task-list__item-title">{task.title}</span>
                <span className="task-list__item-status">{statusLabels[task.status]}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <style>{taskListStyles}</style>
    </section>
  );
}

const taskListStyles = `
  .task-list {
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
  }

  .task-list__header {
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

  .task-list__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .task-list h2 {
    margin: 0;
    font-size: clamp(1.25rem, 2.6vw, 1.8rem);
    letter-spacing: -0.03em;
  }

  .task-list__header p {
    margin: 0.35rem 0 0;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.5;
  }

  .task-list__status {
    flex: 0 0 auto;
    border-radius: 999px;
    background: var(--chronos-sky-soft, #e0f2fe);
    color: var(--chronos-sky-text, #075985);
    font-size: 0.76rem;
    font-weight: 800;
    padding: 0.45rem 0.75rem;
  }

  .task-list__content {
    margin-top: 1rem;
  }

  .task-list__empty {
    margin: 1.5rem 0;
    color: var(--chronos-text-soft, #64748b);
    font-size: 0.9rem;
    font-weight: 700;
    text-align: center;
  }

  .task-list__items {
    display: grid;
    gap: 0.55rem;
    margin: 0;
    padding: 0;
  }

  .task-list__item {
    list-style: none;
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 14px;
    padding: 0.75rem 0.9rem;
    background: var(--chronos-surface-muted, #f1f5f9);
  }

  .task-list__item--done {
    opacity: 0.65;
    text-decoration: line-through;
  }

  .task-list__item-title {
    font-weight: 700;
  }

  .task-list__item-status {
    flex: 0 0 auto;
    border-radius: 999px;
    padding: 0.25rem 0.55rem;
    font-size: 0.7rem;
    font-weight: 800;
    background: var(--chronos-primary-soft, #e0e7ff);
    color: var(--chronos-primary-strong, #312e81);
  }

  .task-list__item--done .task-list__item-status {
    background: var(--chronos-success-soft, #d1fae5);
    color: var(--chronos-success-text, #065f46);
  }

  @media (max-width: 720px) {
    .task-list__header {
      display: grid;
    }
  }
`;
