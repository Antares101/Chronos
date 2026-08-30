import type { TaskStatus } from '../../domain/models';
import type { TodayAssignmentTarget } from '../../server/app/chronos-app';

export type TodayTaskInboxTask = {
  id: string;
  title: string;
  status: TaskStatus;
  blockId: string | null;
};

export type TodayTaskInboxProps = {
  actionPath: string;
  tasks: readonly TodayTaskInboxTask[];
  targets: readonly TodayAssignmentTarget[];
  draft?: { taskId: string; blockId: string };
  actionError?: string | null;
  statusMessage?: string | null;
};

const statusLabels: Record<TaskStatus, string> = { todo: 'To do', done: 'Done' };

export default function TodayTaskInbox({
  actionPath,
  tasks,
  targets,
  draft,
  actionError,
  statusMessage,
}: TodayTaskInboxProps) {
  const openTasks = tasks.filter((task) => task.status === 'todo' && task.blockId === null);
  const hasTargets = targets.length > 0;

  return (
    <section className="today-task-inbox" aria-labelledby="today-task-inbox-title">
      <header>
        <h2 id="today-task-inbox-title" tabIndex={-1}>
          Action Inbox
        </h2>
        <span className="today-task-inbox__count">{openTasks.length} pending</span>
        <span id="today-inbox-feedback" role="status" data-today-inbox-drag-feedback>
          {statusMessage}
        </span>
      </header>
      {openTasks.length === 0 ? (
        <p className="today-task-inbox__empty">
          No open tasks to place. <a href="#today-capture">Capture a task</a>
        </p>
      ) : (
        <ul>
          {openTasks.map((task) => {
            const feedbackId = `today-inbox-feedback-${task.id}`;
            const hasError = draft?.taskId === task.id && Boolean(actionError);
            return (
              <li key={task.id}>
                <div data-assignment-task={task.id}>
                  <strong>{task.title}</strong>
                  <small>{statusLabels[task.status]}</small>
                  <span className="today-task-inbox__drag-cue" aria-hidden="true">
                    Drag to schedule
                  </span>
                </div>
                <details open={draft?.taskId === task.id}>
                  <summary aria-label={`Assign ${task.title} to a block`}>Assign task</summary>
                  <form
                    data-today-inbox-assignment
                    data-assignment-task-id={task.id}
                    method="post"
                    action={actionPath}
                    aria-describedby={hasError ? feedbackId : undefined}
                  >
                    <input type="hidden" name="action" value="assign-task" />
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="feedbackOrigin" value="today-inbox" />
                    {!hasTargets ? (
                      <p className="today-task-inbox__no-targets">
                        No schedule blocks are available.{' '}
                        <a href="#today-quick-block">Create a schedule block</a> first.
                      </p>
                    ) : null}
                    <label>
                      Assign to block
                      <select
                        name="blockId"
                        defaultValue={draft?.taskId === task.id ? draft.blockId : ''}
                        disabled={!hasTargets}
                      >
                        <option value="" disabled>
                          {hasTargets ? 'Choose a block' : 'No blocks available'}
                        </option>
                        {targets.map((target) => (
                          <option key={target.blockId} value={target.blockId}>
                            {target.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="today-task-inbox__actions">
                      <button type="submit" disabled={!hasTargets}>
                        Assign task
                      </button>
                      <button type="reset" data-today-inbox-cancel>
                        Cancel
                      </button>
                    </div>
                    {hasError ? (
                      <p id={feedbackId} role="alert">
                        {actionError}
                      </p>
                    ) : null}
                  </form>
                </details>
              </li>
            );
          })}
        </ul>
      )}
      <style>{styles}</style>
    </section>
  );
}

const styles = `
  .today-task-inbox{min-width:0;border:1px solid var(--chronos-border,var(--border,#cbd5e1));border-radius:var(--radius,1rem);background:var(--chronos-surface,var(--card,#fff));padding:clamp(1rem,2vw,1.5rem)}
  .today-task-inbox header,.today-task-inbox li,.today-task-inbox form{display:grid;gap:.65rem}.today-task-inbox header{grid-template-columns:minmax(0,1fr) auto;align-items:center}.today-task-inbox h2,.today-task-inbox small,.today-task-inbox__empty,.today-task-inbox form p{margin:0}.today-task-inbox__count{border-radius:999px;padding:.2rem .5rem;background:var(--chronos-surface-muted,var(--muted,#f1f5f9));color:var(--chronos-text-muted,var(--muted-foreground,#475569));font-size:.72rem;font-weight:750}.today-task-inbox header>[role=status]{grid-column:1/-1}.today-task-inbox [role=status]:empty{display:none}
  .today-task-inbox ul{display:grid;gap:.65rem;list-style:none;margin:1rem 0 0;padding:0}.today-task-inbox li{border:1px solid var(--chronos-border,var(--border,#cbd5e1));border-radius:.75rem;padding:.75rem}.today-task-inbox li>div{display:grid;gap:.2rem;min-width:0;overflow-wrap:anywhere}.today-task-inbox strong,.today-task-inbox [role=status],.today-task-inbox form p{overflow-wrap:anywhere}.today-task-inbox [data-assignment-draggable=true]{cursor:grab}.today-task-inbox__drag-cue{display:none;color:var(--chronos-text-muted,var(--muted-foreground,#475569));font-size:.72rem}.today-task-inbox [data-assignment-draggable=true] .today-task-inbox__drag-cue{display:inline}.today-task-inbox small,.today-task-inbox__empty,.today-task-inbox__no-targets{color:var(--chronos-text-muted,var(--muted-foreground,#475569))}.today-task-inbox summary{min-height:44px;cursor:pointer;font-weight:800}.today-task-inbox form{margin-top:.65rem}.today-task-inbox label{display:grid;gap:.35rem;font-weight:700}.today-task-inbox select,.today-task-inbox button{min-height:44px;max-width:100%}.today-task-inbox__actions{display:flex;flex-wrap:wrap;gap:.5rem}.today-task-inbox form p{margin:0}.today-task-inbox form [role=alert]{color:var(--chronos-danger,#b91c1c);font-weight:700}.today-task-inbox :is(a,summary,select,button):focus-visible{outline:3px solid var(--chronos-ring,var(--ring,#818cf8));outline-offset:2px}.today-block[data-assignment-state=valid]{border-color:var(--chronos-primary,var(--primary,#4f46e5));box-shadow:0 0 0 3px var(--chronos-primary-soft,#e0e7ff)}.today-block[data-assignment-state=rejected]{border-style:dashed;border-color:var(--chronos-danger,#b91c1c)}.today-task-inbox form[data-assignment-state=submitting]{opacity:.7;pointer-events:none}:root[data-assignment-dragging=true]{user-select:none}
  @media(max-width:48rem){.today-task-inbox__actions,.today-task-inbox button{width:100%}}
`;
