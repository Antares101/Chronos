const shortcuts = [
  ['?', 'Open keyboard shortcuts'],
  ['a', 'Focus the active block'],
  ['i', 'Focus inbox assignment'],
  ['q', 'Focus quick task capture'],
  ['b', 'Focus quick block'],
  ['c', 'Focus block conclusion when available'],
  ['Escape', 'Close the shortcut reference'],
] as const;

export default function TodayShortcutReference() {
  return (
    <section className="today-shortcuts" aria-label="Keyboard shortcuts">
      <button type="button" data-today-shortcuts-trigger aria-label="Keyboard shortcuts">
        Keyboard shortcuts
      </button>
      <dialog data-today-shortcuts-dialog aria-labelledby="today-shortcuts-title">
        <div className="today-shortcuts__content">
          <h2 id="today-shortcuts-title">Keyboard shortcuts</h2>
          <p>Focus controls without changing your work.</p>
          <dl>
            {shortcuts.map(([key, description]) => (
              <div key={key}>
                <dt>
                  <kbd>{key}</kbd>
                </dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
          <button type="button" data-today-shortcuts-close>
            Close shortcuts
          </button>
        </div>
      </dialog>
      <style>{styles}</style>
    </section>
  );
}

const styles = `
.today-shortcuts{--today-shortcuts-surface:var(--chronos-surface,var(--card,#fff));--today-shortcuts-foreground:var(--chronos-text,var(--foreground,#0f172a));display:flex;justify-content:flex-end;min-width:0}.today-shortcuts button{min-height:44px;max-width:100%}.today-shortcuts dialog{box-sizing:border-box;inline-size:min(calc(100dvi - 2rem),34rem);max-inline-size:calc(100dvi - 2rem);margin-inline:auto;overflow-wrap:anywhere;color:var(--today-shortcuts-foreground);background:var(--today-shortcuts-surface);border:1px solid var(--chronos-border,var(--border,#cbd5e1));border-radius:var(--radius,1rem);box-shadow:0 1.5rem 4rem rgb(15 23 42 / .32)}.today-shortcuts dialog::backdrop{background:rgb(15 23 42 / .48)}.today-shortcuts__content{display:grid;gap:1rem;min-width:0;max-inline-size:100%;overflow-wrap:anywhere;padding:clamp(1rem,3vw,1.5rem)}.today-shortcuts h2,.today-shortcuts p,.today-shortcuts dl,.today-shortcuts dd{margin:0}.today-shortcuts dl{display:grid;gap:.5rem;min-width:0}.today-shortcuts dl div{display:grid;grid-template-columns:minmax(5rem,auto) minmax(0,1fr);gap:.75rem;align-items:baseline}.today-shortcuts kbd{display:inline-block;max-inline-size:100%;overflow-wrap:anywhere;border:1px solid var(--chronos-border,var(--border,#cbd5e1));border-radius:.35rem;padding:.15rem .45rem;font:inherit;font-weight:800}.today-shortcuts :is(button,[open]):focus-visible{outline:3px solid var(--chronos-ring,var(--ring,#818cf8));outline-offset:3px}@media(max-width:48rem){.today-shortcuts{justify-content:stretch}.today-shortcuts>button{width:100%}}@media(prefers-reduced-motion:reduce){.today-shortcuts dialog,.today-shortcuts dialog::backdrop{animation:none;transition:none}}@media(prefers-reduced-transparency:reduce){.today-shortcuts{--today-shortcuts-surface:hsl(var(--background));--today-shortcuts-foreground:hsl(var(--foreground))}.today-shortcuts dialog{box-shadow:none}.today-shortcuts dialog::backdrop{background:var(--chronos-backdrop,#0f172a)}}
`;
