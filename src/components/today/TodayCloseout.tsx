import type { TodayWorkspaceView } from '../../server/app/chronos-app';
import type { TodayActionDraft } from '../../server/app/route-contract';

// prettier-ignore
export type TodayCloseoutProps = { closeout: TodayWorkspaceView['closeout']; actionPath: string; draft?: Extract<TodayActionDraft, { action: 'today-save-closeout' }>; actionError?: string | null; statusMessage?: string | null };

// prettier-ignore
export default function TodayCloseout({ closeout, actionPath, draft, actionError, statusMessage }: TodayCloseoutProps) {
  const outcome = draft?.outcome ?? closeout.outcome;
  const adjustment = draft?.tomorrowAdjustment ?? closeout.tomorrowAdjustment;
  const buttonLabel = closeout.state === 'ready' ? 'Update Closeout' : 'Save Closeout';
  const outcomeError = getCloseoutFieldError(
    outcome,
    draft,
    'Enter one outcome from today.',
    'Keep the outcome to 500 characters or fewer.',
    500,
  );
  const adjustmentError = getCloseoutFieldError(
    adjustment,
    draft,
    'Enter one adjustment for tomorrow.',
    'Keep the adjustment to 280 characters or fewer.',
    280,
  );

  return (
    <section className="today-closeout" aria-labelledby="today-closeout-title">
      <header>
        <p>End of Day</p>
        <h2 id="today-closeout-title">Close the Day</h2>
      </header>
      {statusMessage ? (
        <p className="today-closeout__status" role="status">
          {statusMessage}
        </p>
      ) : null}
      {actionError ? (
        <p className="today-closeout__alert" role="alert">
          {actionError} Your draft is ready to correct.
        </p>
      ) : null}
      {closeout.state === 'error' ? (
        <div className="today-closeout__alert" role="alert">
          Daily closeout unavailable. <a href={actionPath}>Try loading it again.</a>
        </div>
      ) : null}
      {closeout.state === 'empty' && !draft ? (
        <p>Record one outcome and one adjustment for tomorrow.</p>
      ) : null}
      {closeout.state !== 'error' || draft ? (
        <form method="post" action={actionPath} className="today-closeout__form">
          <input type="hidden" name="action" value="today-save-closeout" />
          <CloseoutTextareaField
            label="Outcome"
            name="outcome"
            value={outcome}
            maxLength={500}
            error={outcomeError}
            errorId="closeout-outcome-error"
            autoFocus={Boolean(outcomeError)}
          />
          <CloseoutTextareaField
            label="Tomorrow’s Adjustment"
            name="tomorrowAdjustment"
            value={adjustment}
            maxLength={280}
            error={adjustmentError}
            errorId="closeout-adjustment-error"
            autoFocus={!outcomeError && Boolean(adjustmentError)}
          />
          <p id="closeout-help">
            Surrounding spaces are removed when saved. Both fields are required.
          </p>
          <button type="submit">{buttonLabel}</button>
        </form>
      ) : null}
      <style>{styles}</style>
    </section>
  );
}

function getCloseoutFieldError(
  value: string,
  draft: TodayCloseoutProps['draft'],
  requiredError: string,
  maxLengthError: string,
  maxLength: number,
) {
  if (!draft) return null;
  if (!value.trim()) return requiredError;
  return value.length > maxLength ? maxLengthError : null;
}

type CloseoutTextareaFieldProps = {
  label: string;
  name: 'outcome' | 'tomorrowAdjustment';
  value: string;
  maxLength: number;
  error: string | null;
  errorId: string;
  autoFocus: boolean;
};

function CloseoutTextareaField({
  label,
  name,
  value,
  maxLength,
  error,
  errorId,
  autoFocus,
}: CloseoutTextareaFieldProps) {
  return (
    <div className="today-closeout__field">
      <label>
        {label}
        <textarea
          name={name}
          defaultValue={value}
          maxLength={maxLength}
          required
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : 'closeout-help'}
          // biome-ignore lint/a11y/noAutofocus: Server validation intentionally focuses the first invalid field.
          autoFocus={autoFocus}
        />
      </label>
      {error ? (
        <span id={errorId} className="today-closeout__error">
          {error}
        </span>
      ) : null}
    </div>
  );
}

const styles = `
.today-closeout{min-width:0;color:var(--chronos-text,var(--foreground,#0f172a));background:var(--chronos-surface,var(--card,#fff));border:1px solid var(--chronos-border,var(--border,rgba(99,102,241,.22)));border-radius:var(--radius,1rem);padding:clamp(1rem,2vw,1.5rem);overflow-wrap:anywhere}.today-closeout *{box-sizing:border-box;min-width:0}.today-closeout header{display:flex;align-items:baseline;gap:.65rem;flex-wrap:wrap}.today-closeout header p,.today-closeout header h2{margin:0}.today-closeout header p{color:var(--chronos-primary,var(--primary,#4f46e5));font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.today-closeout__form{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:.65rem;margin-top:1rem}.today-closeout__field{display:grid;gap:.3rem;min-width:0}.today-closeout label{display:grid;gap:.3rem;font-weight:750}.today-closeout textarea,.today-closeout button{width:100%;max-width:100%;min-height:44px}.today-closeout textarea{min-height:6rem;resize:vertical}.today-closeout button{align-self:end;border:0;border-radius:.7rem;background:var(--chronos-primary,var(--primary,#4f46e5));color:var(--chronos-button-text,#fff);font-weight:800;cursor:pointer}.today-closeout textarea:focus-visible,.today-closeout button:focus-visible,.today-closeout a:focus-visible{outline:3px solid var(--chronos-ring,var(--ring,#818cf8));outline-offset:2px}.today-closeout__alert,.today-closeout__status{padding:.7rem;border-radius:.7rem;background:var(--chronos-surface-muted,var(--muted,#f1f5f9))}.today-closeout__alert,.today-closeout__error{color:var(--chronos-destructive,#b91c1c)}@media(max-width:48rem){.today-closeout__form{grid-template-columns:1fr}}`;
