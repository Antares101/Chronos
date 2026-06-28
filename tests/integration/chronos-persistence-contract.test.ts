import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const applicationTables = [
  'blocks',
  'tasks',
  'events',
  'pauses',
  'actual_time_entries',
  'conclusion_reviews',
] as const;

async function readProjectFile(path: string): Promise<string> {
  return readFile(join(process.cwd(), path), 'utf8');
}

describe('Chronos persistence contract', () => {
  it('keeps every application table user-scoped and protected by RLS', async () => {
    const initialMigration = await readProjectFile('supabase/migrations/0001_initial.sql');
    const rlsMigration = await readProjectFile('supabase/migrations/0002_rls.sql');

    for (const table of applicationTables) {
      expect(initialMigration).toContain(`create table public.${table}`);
      expect(initialMigration).toContain('user_id uuid not null references auth.users(id)');
      expect(rlsMigration).toContain(`alter table public.${table} enable row level security;`);
      expect(rlsMigration).toContain(`on public.${table}`);
    }

    expect(rlsMigration).toContain('(select auth.uid()) = user_id');
    expect(rlsMigration).toContain('anonymous users receive no table access');
  });

  it('keeps the Drizzle schema aligned to the Chronos MVP shape', async () => {
    const schema = await readProjectFile('src/db/schema.ts');

    expect(schema).toContain("pgEnum('block_category', ['work', 'home', 'training'])");
    expect(schema).toContain("pgEnum('block_phase', ['planning', 'execution', 'conclusion'])");
    expect(schema).toContain("pgEnum('pause_kind', ['5m', '10m', 'untimed'])");
    expect(schema).toContain("pgEnum('actual_activity', ['focus', 'pause', 'inactivity'])");
    expect(schema).toContain("pgTable(\n  'blocks'");
    expect(schema).toContain("pgTable(\n  'actual_time_entries'");
    expect(schema).toContain("pgTable(\n  'conclusion_reviews'");
  });

  it('persists planned schedule separately from actual time and conclusion reviews', async () => {
    const initialMigration = await readProjectFile('supabase/migrations/0001_initial.sql');
    const rlsMigration = await readProjectFile('supabase/migrations/0002_rls.sql');

    expect(initialMigration).toContain('planned_start timestamptz not null');
    expect(initialMigration).toContain('planned_end timestamptz not null');
    expect(initialMigration).toContain('create table public.actual_time_entries');
    expect(initialMigration).toContain('phase public.block_phase not null');
    expect(initialMigration).toContain('activity public.actual_activity not null');
    expect(initialMigration).toContain(
      'pause_id uuid references public.pauses(id) on delete set null',
    );
    expect(initialMigration).toContain('planned_minutes integer not null');
    expect(initialMigration).toContain('actual_minutes integer not null');
    expect(rlsMigration).toContain('actual_time_entries.pause_id is null');
    expect(rlsMigration).toContain('pauses.id = actual_time_entries.pause_id');
  });
});
