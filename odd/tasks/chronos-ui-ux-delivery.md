# Chronos UI/UX delivery
Status: in progress. Strategy: feature-branch-chain. Target: Antares101/Chronos:main.
Preserve the original refactor/ui-ux branch and coordinate verified delivery of its existing history.

## Specs

1. **S1** — "dale hasta que termines todo el plan y quede verificado y mergeado"
2. **S2** — "Completar entrega y merge con gates normales" / "Preservar refactor/ui-ux; construir unidades coherentes, usar ramas/worktrees propios, publicar issue/PR y mergear sólo con verificaciones y aprobaciones requeridas. Sin force ni bypass."
3. **S3** — "Sesión existente de GitHub CLI, sólo ese destino" / "Autorizar discovery y operaciones de issue/etiquetas no protegidas, push HTTPS, PR/checks/merge en ese repositorio; verificar identidad/permisos antes de escribir. No mostrar tokens ni autoaprobar issues."
4. **S4** — "Toda la rama histórica" / "Cadena feature/tracker — recomendada"
5. **S5** — "Crear la definición, sin aprobar nada". The exact approved definition is `status:approved`, color `0E8A16`, description `Maintainer-approved scope; requires explicit approval.` This is definition authority, not authority to approve an issue.
6. **S6** — "Autorizar ese directorio exacto". The exact private temporary-directory binding is retained in the private operations journal, not copied into public repository notes.

## Tasks

- **T1 [S1-S4]** — in_progress — route: parent — commit: pending — Verify the authorized session/target and create the owned ODD coordination record and bootstrap commit.
- **T2 [S1,S3,S5,S6]** — pending — route: parent operations plus explicit human approval — commit: metadata receipts pending — Create the coordinating issue and reviewed label definitions; obtain separately authorized approval of the actual issue.
- **T3 [S1,S2,S4]** — pending — route: bounded read-only explorer, parent architecture — commit: pending — Establish coherent behavior/test/documentation units and dependencies for reconstruction; do not execute the rejected interval table.
- **T4 [S1,S2,S4]** — pending — route: parent Git, bounded writers only when their trigger holds, risk-gated independent verification and native review — commit: per-unit evidence pending — Reconstruct owned delivery branches and verify each candidate without changing the original branch.
- **T5 [S1-S4]** — pending — route: parent Git/GitHub/CI — commit: per-unit PR evidence pending — Publish the selected feature/tracker chain with approved issue linkage, one type label, clean bases, and observed checks; keep the tracker draft/no-merge.
- **T6 [S1-S4]** — pending — route: parent integration, applicable independent verification and native review — commit: integration evidence pending — Integrate children and the complete historical outcome, verify the final tree and required gates, and merge only when satisfied.
- **T7 [S1,S2]** — pending — route: parent — commit: closeout evidence pending — Verify principal-branch integration; preserve useful notes and clean only proven-owned local resources. Remote branch deletion is not authorized.

## Log

- **L1** — Original request verbatim: "Goal set: dale hasta que termines todo el plan y quede verificado y mergeado"
- **L2** — Continuation verbatim:

  > Continue working toward the goal:
  > dale hasta que termines todo el plan y quede verificado y mergeado

- **L3** — The human selected the exact operational and session choices quoted in S2-S3. Ordinary target-bound delivery is authorized; force, bypass, alternative credentials, SSH-agent discovery, and automatic issue approval are not.
- **L4** — The human previously selected the entire historical branch and feature/tracker chain, quoted in S4. Preserve those choices; do not silently narrow the outcome or switch strategies.
- **L5** — Starting snapshot: original `refactor/ui-ux` at `ac2eed4802da00635675a0a3a2abf676787147f1`; verified target `main` at `f8ddc313fe69b419e38aad7be8cf78a2ecaa73b0`. The linear range has 91 commits. One earlier read-only pass measured 35 provisional intervals; 16 exceeded 400 public text lines and several mixed independent behaviors. That table is not an approved executable chain.
- **L6** — Existing final-state verification and historical failures remain evidence, not proof for isolated child snapshots. Three live/destructive browser-smoke tests were excluded from the earlier unit suite. The public main `quality` check failed before delivery; no future-candidate CI result is inferred.
- **L7** — GitHub CLI 2.96.0 verified active actor `Antares101`, exact target `Antares101/Chronos`, permission `ADMIN`, issues and blank issues enabled, no issue templates, default branch `main`, and merge commits allowed. Raw authentication output and credentials were not printed or stored. Protected label application still needs a fresh instruction binding the actual issue number and action.
- **L8** — The human authorized the exact private temporary location and the S5 label definition only. Private issue/PR body/readback files require owner-restricted permissions and cleanup on each outcome; no credential data is stored. The exact outside-repository path is deliberately omitted here.
- **L9** — Owned resource created from verified main: branch `chore/ui-ux-delivery`, worktree `.worktrees/chronos/ui-ux-delivery`. The parent directories `.worktrees` and `.worktrees/chronos` did not exist before this task. Added only the local exclusion `/.worktrees/chronos/ui-ux-delivery/` to `.git/info/exclude`; preserve unrelated entries. Other registered worktrees and branches predate this task and are not cleanup targets.
- **L10** — This real coordination record can bootstrap a nonempty draft tracker; do not invent a placeholder commit merely to open an empty PR. Keep ongoing coordination-only edits separate from child review scopes when needed to avoid polluted diffs.
- **L11** — No application behavior has been edited for this delivery. Applicable passive checks and normal hooks cover the bootstrap record; there is no meaningful RED for a tracking document. Every later candidate needs its own applicable functional evidence, risk classification, and required approvals.
