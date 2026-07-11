import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const migrationPath = join(process.cwd(), 'supabase/migrations/0004_daily_workspaces.sql');

describe('daily_workspaces migration contract', () => {
  it('creates one user-owned workspace per valid UTC date key', () => {
    const sql = readFileSync(migrationPath, 'utf8').replace(/\s+/g, ' ');

    expect(sql).toMatch(/create table public\.daily_workspaces/i);
    expect(sql).toMatch(/id uuid primary key default gen_random_uuid\(\)/i);
    expect(sql).toMatch(/user_id uuid not null references auth\.users\(id\) on delete cascade/i);
    expect(sql).toMatch(/workspace_date text not null/i);
    expect(sql).toMatch(/created_at timestamptz not null default now\(\)/i);
    expect(sql).toMatch(/updated_at timestamptz not null default now\(\)/i);
    expect(sql).toMatch(/unique \(user_id, workspace_date\)/i);
    expect(sql).toContain("workspace_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'");
    expect(sql).toMatch(/to_char\(workspace_date::date, 'YYYY-MM-DD'\) = workspace_date/i);
  });

  it('allows an empty header and a complete closeout pair, but rejects invalid text states', () => {
    const sql = readFileSync(migrationPath, 'utf8').replace(/\s+/g, ' ');

    expect(sql).toMatch(/focus text/i);
    expect(sql).toMatch(/constraints text/i);
    expect(sql).toMatch(/outcome text/i);
    expect(sql).toMatch(/tomorrow_adjustment text/i);
    expect(sql).toContain('focus = btrim(focus)');
    expect(sql).toContain('char_length(focus) between 1 and 160');
    expect(sql).toContain('constraints = btrim(constraints)');
    expect(sql).toContain('char_length(constraints) between 1 and 500');
    expect(sql).toContain('outcome = btrim(outcome)');
    expect(sql).toContain('char_length(outcome) between 1 and 500');
    expect(sql).toContain('tomorrow_adjustment = btrim(tomorrow_adjustment)');
    expect(sql).toContain('char_length(tomorrow_adjustment) between 1 and 280');
    expect(sql).toContain('(outcome is null and tomorrow_adjustment is null)');
    expect(sql).toContain('(outcome is not null and tomorrow_adjustment is not null)');
  });

  it('keys uniqueness by owner and date, allowing separate users or dates', () => {
    const sql = readFileSync(migrationPath, 'utf8').replace(/\s+/g, ' ');

    expect(sql).toMatch(/unique \(user_id, workspace_date\)/i);
    expect(sql).not.toMatch(/unique \(workspace_date\)/i);
    expect(sql).not.toMatch(/unique \(user_id\)/i);
  });

  it('limits every operation to the authenticated owner and grants no anonymous policy', () => {
    const sql = readFileSync(migrationPath, 'utf8').replace(/\s+/g, ' ');

    expect(sql).toMatch(/alter table public\.daily_workspaces enable row level security/i);
    expect(sql).toMatch(
      /for select to authenticated using \(\(select auth\.uid\(\)\) = user_id\)/i,
    );
    expect(sql).toMatch(
      /for insert to authenticated with check \(\(select auth\.uid\(\)\) = user_id\)/i,
    );
    expect(sql).toMatch(
      /for update to authenticated using \(\(select auth\.uid\(\)\) = user_id\) with check \(\(select auth\.uid\(\)\) = user_id\)/i,
    );
    expect(sql).toMatch(
      /for delete to authenticated using \(\(select auth\.uid\(\)\) = user_id\)/i,
    );
    expect(sql).not.toMatch(/to anon/i);
  });
});
