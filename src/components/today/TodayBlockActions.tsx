import type { ReactNode } from 'react';
import type { PauseKind, TaskStatus } from '../../domain/models';

export type TodayBlockAction =
  | { kind: 'start' }
  | { kind: 'pause' }
  | { kind: 'resume'; pauseId: string }
  | { kind: 'event' }
  | { kind: 'task' }
  | { kind: 'conclusion'; tasks: readonly { id: string; title: string; status: TaskStatus }[] };
export type TodayBlockActionsProps = {
  actionPath: string;
  block: { id: string; title: string };
  actions: readonly TodayBlockAction[];
  conclusionFeedback?: { actionError?: string | null; statusMessage?: string | null };
};

export default function TodayBlockActions({
  actionPath,
  block,
  actions,
  conclusionFeedback,
}: TodayBlockActionsProps) {
  if (!actions.length) return <NoActions />;
  // prettier-ignore
  return <details className="today-block__actions"><summary>Actions for {block.title}</summary><TodayInlineBlockActions actionPath={actionPath} block={block} actions={actions} conclusionFeedback={conclusionFeedback} /></details>;
}

export function TodayInlineBlockActions({
  actionPath,
  block,
  actions,
  conclusionFeedback,
}: TodayBlockActionsProps) {
  if (!actions.length) return <NoActions />;
  // prettier-ignore
  return <div className="today-block__actions"><div className="today-block__action-groups">{actions.map((action, index) => <ActionForm key={`${action.kind}-${index}`} action={action} path={actionPath} block={block} conclusionFeedback={conclusionFeedback} />)}</div></div>;
}

function NoActions() {
  return <p className="today-block__no-actions">No actions currently available.</p>;
}

type ActionProps = {
  action: TodayBlockAction;
  path: string;
  block: TodayBlockActionsProps['block'];
  conclusionFeedback?: TodayBlockActionsProps['conclusionFeedback'];
};
function ActionForm({ action, path, block, conclusionFeedback }: ActionProps) {
  // prettier-ignore
  if (action.kind === 'start') return <BaseForm path={path} action="start-block" block={block} button={`Start ${block.title}`} />;
  if (action.kind === 'resume')
    return (
      <BaseForm
        path={path}
        action="end-pause"
        block={block}
        button={`Resume ${block.title}`}
        fields={<input type="hidden" name="pauseId" value={action.pauseId} />}
      />
    );
  if (action.kind === 'pause') return <PauseForm path={path} block={block} />;
  if (action.kind === 'event')
    return (
      <TextForm
        path={path}
        action="create-highlighted-event"
        block={block}
        label="Highlighted event"
        button="Record event"
      />
    );
  if (action.kind === 'task')
    return (
      <TextForm
        path={path}
        action="create-task"
        block={block}
        label="Task title"
        button="Add task"
      />
    );
  return (
    <ConclusionForm path={path} block={block} tasks={action.tasks} feedback={conclusionFeedback} />
  );
}

type BaseProps = {
  path: string;
  action: string;
  block: ActionProps['block'];
  button: string;
  fields?: ReactNode;
};
function BaseForm({ path, action, block, button, fields }: BaseProps) {
  // prettier-ignore
  return <form method="post" action={path}><input type="hidden" name="action" value={action} /><input type="hidden" name="blockId" value={block.id} />{fields}<button type="submit">{button}</button></form>;
}

const pauseKinds: { value: PauseKind; label: string }[] = [
  { value: '5m', label: '5 minutes' },
  { value: '10m', label: '10 minutes' },
  { value: 'untimed', label: 'Untimed' },
];
function PauseForm({ path, block }: Omit<ActionProps, 'action'>) {
  // prettier-ignore
  return <form method="post" action={path}><input type="hidden" name="action" value="log-pause" /><input type="hidden" name="blockId" value={block.id} /><label>Pause type<select name="pauseKind" defaultValue="5m">{pauseKinds.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label><label>Pause note <span>(optional)</span><input name="note" autoComplete="off" /></label><button type="submit">Pause {block.title}</button></form>;
}

type TextProps = Omit<ActionProps, 'action'> & {
  action: 'create-highlighted-event' | 'create-task';
  label: string;
  button: string;
};
function TextForm({ path, action, block, label, button }: TextProps) {
  const accessibleName =
    action === 'create-highlighted-event' ? 'Record a highlighted event' : 'Add a task';
  // prettier-ignore
  return <TodayTextBlockActionForm path={path} action={action} block={block} label={label} button={button} accessibleName={accessibleName} />;
}

export function TodayTextBlockActionForm({
  path,
  action,
  block,
  label,
  button,
  accessibleName,
}: TextProps & { accessibleName: string }) {
  // prettier-ignore
  return <form method="post" action={path}><input type="hidden" name="action" value={action} /><input type="hidden" name="blockId" value={block.id} />{action === 'create-task' ? <input type="hidden" name="feedbackOrigin" value="today-day-sheet" /> : null}<label>{label}<input name="title" required autoComplete="off" maxLength={120} pattern={action === 'create-task' ? '.*\\S.*' : undefined} /></label><button type="submit" aria-label={`${accessibleName} for ${block.title}`}>{button}</button></form>;
}

function ConclusionForm({
  path,
  block,
  tasks,
  feedback,
}: Omit<ActionProps, 'action'> & {
  tasks: Extract<TodayBlockAction, { kind: 'conclusion' }>['tasks'];
  feedback?: TodayBlockActionsProps['conclusionFeedback'];
}) {
  const feedbackOrigin = <input type="hidden" name="feedbackOrigin" value="today-close-review" />;
  // prettier-ignore
  return <section className="today-close-review" aria-label="Block conclusion"><details data-today-close-review open={Boolean(feedback?.actionError)}><summary>Review & conclude</summary><form method="post" action={path}>{feedbackOrigin}<input type="hidden" name="action" value="conclude-block" /><input type="hidden" name="blockId" value={block.id} /><fieldset><legend>Completed tasks</legend>{tasks.length ? tasks.map((task) => <label key={task.id}><input type="checkbox" name="completedTaskIds" value={task.id} defaultChecked={task.status === 'done'} />{task.title}</label>) : <span>No tasks to mark.</span>}</fieldset><label>Conclusion notes<textarea name="notes" required aria-invalid={feedback?.actionError ? true : undefined} /></label><label>Tomorrow adjustment <span>(optional)</span><textarea name="nextAdjustment" /></label>{feedback?.actionError ? <p role="alert">{feedback.actionError}</p> : null}<button type="submit">Conclude {block.title}</button><button type="button" data-today-close-review-dismiss>Dismiss review</button></form></details><form method="post" action={path}>{feedbackOrigin}<input type="hidden" name="action" value="conclude-block-without-review" /><input type="hidden" name="blockId" value={block.id} /><button type="submit">Conclude without review</button></form>{feedback?.statusMessage ? <p role="status">{feedback.statusMessage}</p> : null}</section>;
}
