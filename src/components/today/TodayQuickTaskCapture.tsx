'use client';

import { type SyntheticEvent, useRef, useState } from 'react';
import type { TaskDestination } from '../../domain/services/today-workspace';
import type { TodayWorkspaceView } from '../../server/app/chronos-app';
import type { TodayActionDraft } from '../../server/app/route-contract';

export type TodayQuickTaskCaptureProps = {
  capture: TodayWorkspaceView['capture'];
  actionPath: string;
  draft?: Extract<TodayActionDraft, { action: 'today-create-task' }>;
  actionError?: string | null;
  statusMessage?: string | null;
  initialOverride?: boolean;
  initialDestination?: string;
};

type PendingRef = { current: boolean };
export function claimQuickTaskSubmission(pending: PendingRef) {
  if (pending.current) return false;
  pending.current = true;
  return true;
}

const destinationKey = (destination: TaskDestination) =>
  destination.kind === 'block' ? `block:${destination.blockId}` : 'unassigned';

export default function TodayQuickTaskCapture({
  capture,
  actionPath,
  draft,
  actionError,
  statusMessage,
  initialOverride,
  initialDestination,
}: TodayQuickTaskCaptureProps) {
  const defaultKey = capture.defaultDestination ? destinationKey(capture.defaultDestination) : '';
  const startingDestination = initialDestination ?? draft?.destination ?? defaultKey;
  const [title, setTitle] = useState(draft?.title ?? '');
  const [destination, setDestination] = useState(startingDestination);
  const [override, setOverride] = useState(
    initialOverride ??
      (!defaultKey || (!!startingDestination && startingDestination !== defaultKey)),
  );
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const destinationError = !!actionError && /destination/i.test(actionError);
  const titleError = !!actionError && !destinationError;

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    if (!claimQuickTaskSubmission(pendingRef)) {
      event.preventDefault();
      return;
    }
    setPending(true);
  }

  return (
    <section className="today-quick-capture" aria-labelledby="today-quick-capture-title">
      <header>
        <p>Quick Capture</p>
        <h2 id="today-quick-capture-title">Add a Task</h2>
      </header>
      {actionError ? (
        <p id="capture-error" role="alert">
          {actionError}
        </p>
      ) : null}
      {!actionError && statusMessage ? <p role="status">{statusMessage}</p> : null}
      <form method="post" action={actionPath} onSubmit={submit} aria-busy={pending}>
        <input type="hidden" name="action" value="today-create-task" />
        <label htmlFor="today-quick-task-title">Task Title</label>
        <input
          id="today-quick-task-title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          required
          maxLength={120}
          pattern=".*\S.*"
          title="Enter a task title."
          autoComplete="off"
          placeholder="Capture the next task…"
          aria-invalid={titleError || undefined}
          aria-describedby={titleError ? 'capture-error' : undefined}
        />
        {defaultKey && !override ? (
          <>
            <input type="hidden" name="destination" value={defaultKey} />
            <p>Target: {capture.defaultDestination?.label}</p>
            <button type="button" onClick={() => setOverride(true)}>
              Change Destination
            </button>
          </>
        ) : (
          <>
            <label htmlFor="today-task-destination">Destination</label>
            {!defaultKey ? <p>No automatic target—choose where this task belongs.</p> : null}
            <select
              id="today-task-destination"
              name="destination"
              value={destination}
              onChange={(event) => setDestination(event.currentTarget.value)}
              required
              aria-invalid={destinationError || undefined}
              aria-describedby={destinationError ? 'capture-error' : undefined}
            >
              <option value="">Choose a destination</option>
              {capture.destinations.map((item) => (
                <option key={destinationKey(item)} value={destinationKey(item)}>
                  {item.label}
                </option>
              ))}
            </select>
          </>
        )}
        <button type="submit" disabled={pending}>
          {pending ? 'Adding…' : 'Add Task'}
        </button>
      </form>
    </section>
  );
}
