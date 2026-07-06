import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const migrationPath = join(process.cwd(), 'supabase/migrations/0003_today_goals.sql');

describe('today_goals migration security contract', () => {
  it('creates a user-owned goals table with the required auth.users foreign key', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql).toMatch(/create table public\.today_goals/i);
    expect(sql).toMatch(/user_id uuid not null references auth\.users\(id\) on delete cascade/i);
    expect(sql).toMatch(/goal_date text not null/i);
    expect(sql).toMatch(
      /create index today_goals_user_date_idx\s+on public\.today_goals\(user_id, goal_date\)/i,
    );
  });

  it('enables RLS and owner policies for every operation using auth.uid()', () => {
    const sql = readFileSync(migrationPath, 'utf8').replace(/\s+/g, ' ');

    expect(sql).toMatch(/alter table public\.today_goals enable row level security/i);
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
  });
});
