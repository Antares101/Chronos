export type TodayGoalsPanelProps = {
  title: string;
  description: string;
  goals: readonly { id: string; title: string; position: number }[];
  maxGoals: 3;
  actionPath: string;
  draft?: { action: 'today-save-goals'; goals: readonly string[] };
  actionError?: string | null;
  statusMessage?: string | null;
};

export default function TodayGoalsPanel({
  title,
  description,
  goals,
  maxGoals,
  actionPath,
  draft,
  actionError,
  statusMessage,
}: TodayGoalsPanelProps) {
  const fields = Array.from(
    { length: maxGoals },
    (_, index) => draft?.goals[index] ?? goals[index]?.title ?? '',
  );

  return (
    <section className="today-goals" aria-labelledby="today-goals-title">
      <header className="today-goals__header">
        <p className="today-goals__eyebrow">Today goals</p>
        <h4 id="today-goals-title">{title}</h4>
        <p>{description}</p>
      </header>

      <form
        className="today-goals__form"
        method="post"
        action={actionPath}
        aria-describedby={actionError ? 'today-goals-feedback' : undefined}
      >
        <input type="hidden" name="action" value="today-save-goals" />
        {fields.map((value, index) => (
          <label key={index}>
            Goal {index + 1}
            <input
              name="goals"
              maxLength={120}
              placeholder={index === 0 ? 'Pick up to three outcomes for today.' : 'Optional'}
              defaultValue={value}
            />
          </label>
        ))}
        <button type="submit">Save goals</button>
        {actionError ? (
          <p id="today-goals-feedback" className="today-goals__feedback" role="alert">
            {actionError}
          </p>
        ) : null}
        {statusMessage ? (
          <p className="today-goals__feedback today-goals__feedback--success" role="status">
            {statusMessage}
          </p>
        ) : null}
      </form>

      <style>{styles}</style>
    </section>
  );
}

const styles = `
  .today-goals {
    min-width: 0;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 24px;
    background: var(--chronos-surface, #ffffff);
    color: var(--chronos-text, #0f172a);
    box-shadow: var(--chronos-shadow, 0 24px 70px rgba(15, 23, 42, 0.1));
    padding: clamp(1rem, 2vw, 1.5rem);
  }

  .today-goals__header {
    min-width: 0;
    overflow-wrap: anywhere;
    border: 1px solid var(--chronos-border, rgba(148, 163, 184, 0.22));
    border-radius: 18px;
    padding: 1rem;
    background: var(--chronos-header-surface, linear-gradient(135deg, var(--chronos-surface, #ffffff), var(--chronos-surface-tinted, #eef2ff)));
  }

  .today-goals__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--chronos-primary, #4f46e5);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .today-goals h4,
  .today-goals p {
    margin: 0;
  }

  .today-goals__header p:last-child {
    margin-top: 0.35rem;
    color: var(--chronos-text-muted, #475569);
    line-height: 1.5;
  }

  .today-goals__form {
    display: grid;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .today-goals label {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
    color: var(--chronos-text-muted, #475569);
    font-size: 0.82rem;
    font-weight: 800;
  }

  .today-goals input,
  .today-goals button {
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
  }

  .today-goals input {
    border: 1px solid var(--chronos-input, rgba(99, 102, 241, 0.22));
    border-radius: 12px;
    background: var(--chronos-surface-muted, #f1f5f9);
    color: var(--chronos-text, #0f172a);
    padding: 0.7rem 0.8rem;
  }

  .today-goals button {
    border: 0;
    border-radius: 14px;
    background: var(--chronos-primary, #4f46e5);
    color: var(--chronos-button-text, #ffffff);
    cursor: pointer;
    font-weight: 850;
    min-height: 2.75rem;
    padding: 0.7rem 1rem;
  }

  .today-goals__feedback {
    margin: 0;
    color: var(--chronos-destructive, #b91c1c);
    font-size: 0.9rem;
    font-weight: 700;
  }

  .today-goals__feedback--success {
    color: var(--chronos-success, #059669);
  }
`;
