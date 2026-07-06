export type QuickTaskCaptureBlock = {
  id: string;
  title: string;
  phase: string;
};

export type QuickTaskCaptureProps = {
  blocks: readonly QuickTaskCaptureBlock[];
  currentBlockId: string | null;
  currentBlockTitle: string | null;
};

export default function QuickTaskCapture({
  blocks,
  currentBlockId,
  currentBlockTitle,
}: QuickTaskCaptureProps) {
  const currentBlock = blocks.find((block) => block.id === currentBlockId) ?? null;
  const defaultBlockId = currentBlock?.id ?? null;
  const defaultBlockTitle = currentBlockTitle ?? currentBlock?.title ?? null;
  const hasTargets = blocks.length > 0;
  const helperText = !hasTargets
    ? 'Create or start a block first.'
    : defaultBlockId
      ? `Targeting ${defaultBlockTitle}. You can change it before adding the task.`
      : 'Choose a target block before adding the task.';

  return (
    <article className="quick-task-capture" aria-labelledby="quick-task-capture-heading">
      <header className="quick-task-capture__header">
        <p className="quick-task-capture__eyebrow">Quick capture</p>
        <h3 id="quick-task-capture-heading">Add a task for today</h3>
        <p id="quick-task-capture-help">{helperText}</p>
      </header>

      <form
        method="post"
        className="quick-task-capture__form"
        aria-describedby="quick-task-capture-help quick-task-capture-title-note"
      >
        <input type="hidden" name="action" value="create-task" />

        <div className="quick-task-capture__field quick-task-capture__field--title">
          <label htmlFor="quick-task-capture-title-input">Task title</label>
          <input
            id="quick-task-capture-title-input"
            name="title"
            required
            maxLength={120}
            pattern={'.*\\S.*'}
            title="Enter a task title."
            placeholder="Capture the next task…"
            disabled={!hasTargets}
            autoComplete="off"
            aria-describedby="quick-task-capture-help quick-task-capture-title-note"
          />
          <small id="quick-task-capture-title-note">Use a short, specific task title.</small>
        </div>

        <div className="quick-task-capture__field quick-task-capture__field--target">
          <label htmlFor="quick-task-capture-block-select">Target block</label>
          <select
            id="quick-task-capture-block-select"
            name="blockId"
            required
            defaultValue={defaultBlockId ?? ''}
            disabled={!hasTargets}
            aria-describedby="quick-task-capture-help"
          >
            {defaultBlockId ? null : (
              <option value="" disabled>
                {hasTargets ? 'Choose a block' : 'Create or start a block first'}
              </option>
            )}
            {blocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.title} · {block.phase}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={!hasTargets}>
          Add task
        </button>
      </form>

      <style>{styles}</style>
    </article>
  );
}

const styles = `
  .quick-task-capture {
    display: grid;
    gap: clamp(0.85rem, 1.8vw, 1rem);
    margin-top: clamp(0.75rem, 1.8vw, 1.25rem);
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--app-border, rgba(99, 102, 241, 0.22));
    border-radius: 1.25rem;
    background: linear-gradient(
      135deg,
      var(--app-surface, var(--card, #ffffff)),
      var(--app-surface-tinted, rgba(238, 242, 255, 0.72))
    );
    color: var(--app-text, var(--foreground, #0f172a));
    padding: clamp(0.95rem, 2vw, 1.2rem);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .quick-task-capture__header {
    display: grid;
    gap: 0.25rem;
    min-width: 0;
  }

  .quick-task-capture__eyebrow {
    margin: 0;
    color: var(--app-accent, var(--primary, #4f46e5));
    font-size: 0.72rem;
    font-weight: 850;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .quick-task-capture h3,
  .quick-task-capture p {
    margin: 0;
  }

  .quick-task-capture h3 {
    font-size: clamp(1.05rem, 2vw, 1.25rem);
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  .quick-task-capture__header p:last-child {
    color: var(--app-text-muted, var(--muted-foreground, #64748b));
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .quick-task-capture__form {
    display: grid;
    grid-template-columns: minmax(min(100%, 16rem), 1.15fr) minmax(min(100%, 13rem), 0.85fr) auto;
    align-items: end;
    gap: 0.75rem;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .quick-task-capture__field {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .quick-task-capture label {
    color: var(--app-text-muted, var(--muted-foreground, #64748b));
    font-size: 0.78rem;
    font-weight: 800;
  }

  .quick-task-capture small {
    color: var(--app-text-muted, var(--muted-foreground, #64748b));
    font-size: 0.76rem;
    font-weight: 700;
    line-height: 1.35;
  }

  .quick-task-capture input,
  .quick-task-capture select,
  .quick-task-capture button {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .quick-task-capture input,
  .quick-task-capture select {
    min-height: 2.75rem;
    border: 1px solid var(--app-border-strong, rgba(99, 102, 241, 0.32));
    border-radius: 0.9rem;
    background: var(--app-surface, var(--card, #ffffff));
    color: var(--app-text, var(--foreground, #0f172a));
    font: inherit;
    font-weight: 700;
    padding: 0.65rem 0.8rem;
  }

  .quick-task-capture input::placeholder {
    color: var(--app-text-soft, #64748b);
  }

  .quick-task-capture button {
    min-height: 2.75rem;
    border: 1px solid var(--app-primary, var(--chronos-primary, #4f46e5));
    border-radius: 999px;
    background: var(--app-primary, var(--chronos-primary, #4f46e5));
    color: var(--app-button-text, var(--chronos-button-text, #ffffff));
    cursor: pointer;
    font: inherit;
    font-weight: 850;
    padding: 0.65rem 1rem;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.18);
    touch-action: manipulation;
  }

  .quick-task-capture button:hover:not(:disabled) {
    border-color: var(--app-primary-strong, var(--chronos-primary-strong, #4338ca));
    background: var(--app-primary-strong, var(--chronos-primary-strong, #4338ca));
  }

  .quick-task-capture input:focus-visible,
  .quick-task-capture select:focus-visible,
  .quick-task-capture button:focus-visible {
    outline: 3px solid var(--app-ring, var(--ring, rgba(79, 70, 229, 0.35)));
    outline-offset: 2px;
  }

  .quick-task-capture input:disabled,
  .quick-task-capture select:disabled,
  .quick-task-capture button:disabled {
    border-color: rgba(148, 163, 184, 0.42);
    background: var(--app-surface-muted, rgba(241, 245, 249, 0.86));
    color: var(--app-text-muted, var(--muted-foreground, #64748b));
    cursor: not-allowed;
    opacity: 1;
  }

  @media (max-width: 48rem) {
    .quick-task-capture__form {
      grid-template-columns: 1fr;
    }

    .quick-task-capture button {
      width: 100%;
    }
  }
`;
