import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createMockLocalChronosAppRepositories } from '../app/local-fixture';

describe('DailyWorkspaceRepository', () => {
  it('finds rows only for the requested user and workspace date', async () => {
    const repository = createMockLocalChronosAppRepositories('user-a').dailyWorkspaces;

    expect(
      await repository.findForDay({ userId: 'user-a', workspaceDate: '2026-07-11' }),
    ).toBeNull();

    await repository.saveHeader(
      { userId: 'user-a', workspaceDate: '2026-07-11' },
      { focus: 'Ship W02', constraints: null },
    );
    await repository.saveHeader(
      { userId: 'user-b', workspaceDate: '2026-07-11' },
      { focus: 'Other user', constraints: null },
    );
    await repository.saveHeader(
      { userId: 'user-a', workspaceDate: '2026-07-12' },
      { focus: 'Other day', constraints: null },
    );

    await expect(
      repository.findForDay({ userId: 'user-a', workspaceDate: '2026-07-11' }),
    ).resolves.toMatchObject({ userId: 'user-a', workspaceDate: '2026-07-11', focus: 'Ship W02' });
    await expect(
      repository.findForDay({ userId: 'user-b', workspaceDate: '2026-07-11' }),
    ).resolves.toMatchObject({ userId: 'user-b', focus: 'Other user' });
    await expect(
      repository.findForDay({ userId: 'user-a', workspaceDate: '2026-07-12' }),
    ).resolves.toMatchObject({ workspaceDate: '2026-07-12', focus: 'Other day' });
  });

  it('creates a closeout-only row without inventing header content', async () => {
    const repository = createMockLocalChronosAppRepositories('user-a').dailyWorkspaces;

    await expect(
      repository.saveCloseout(
        { userId: 'user-a', workspaceDate: '2026-07-11' },
        { outcome: 'Closed cleanly', tomorrowAdjustment: 'Start earlier' },
      ),
    ).resolves.toMatchObject({
      focus: null,
      constraints: null,
      outcome: 'Closed cleanly',
      tomorrowAdjustment: 'Start earlier',
    });
  });

  it('keeps header and closeout writes isolated', async () => {
    const repository = createMockLocalChronosAppRepositories('user-a').dailyWorkspaces;
    const query = { userId: 'user-a', workspaceDate: '2026-07-11' };

    await repository.saveHeader(query, { focus: 'Focus', constraints: 'Constraint' });
    await expect(
      repository.saveCloseout(query, {
        outcome: 'Repository wired',
        tomorrowAdjustment: 'Start W03',
      }),
    ).resolves.toMatchObject({
      focus: 'Focus',
      constraints: 'Constraint',
      outcome: 'Repository wired',
      tomorrowAdjustment: 'Start W03',
    });

    await expect(
      repository.saveHeader(query, { focus: null, constraints: null }),
    ).resolves.toMatchObject({
      focus: null,
      constraints: null,
      outcome: 'Repository wired',
      tomorrowAdjustment: 'Start W03',
    });
  });

  it('uses scoped conflict upserts that update only method-owned columns', () => {
    const source = readFileSync(join(process.cwd(), 'src/server/repositories/drizzle.ts'), 'utf8');
    const repository = source.slice(
      source.indexOf('export class DrizzleDailyWorkspaceRepository'),
      source.indexOf('export class DrizzleEventRepository'),
    );
    const findMethod = repository.slice(
      repository.indexOf('async findForDay'),
      repository.indexOf('async saveHeader'),
    );
    const headerMethod = repository.slice(
      repository.indexOf('async saveHeader'),
      repository.indexOf('async saveCloseout'),
    );
    const closeoutMethod = repository.slice(repository.indexOf('async saveCloseout'));

    expect(findMethod).toContain('eq(dailyWorkspaces.userId, query.userId)');
    expect(findMethod).toContain('eq(dailyWorkspaces.workspaceDate, query.workspaceDate)');

    for (const method of [headerMethod, closeoutMethod]) {
      expect(method).toContain('onConflictDoUpdate');
      expect(method).toContain('dailyWorkspaces.userId');
      expect(method).toContain('dailyWorkspaces.workspaceDate');
      expect(method).toContain('updatedAt');
    }
    expect(headerMethod).toContain('focus: input.focus');
    expect(headerMethod).toContain('constraints: input.constraints');
    expect(headerMethod).not.toContain('outcome: input.outcome');
    expect(closeoutMethod).toContain('outcome: input.outcome');
    expect(closeoutMethod).toContain('tomorrowAdjustment: input.tomorrowAdjustment');
    expect(closeoutMethod).not.toContain('focus: input.focus');
  });
});
