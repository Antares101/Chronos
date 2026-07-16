import { describe, expect, it } from 'vitest';

import type { ChronosAppRepositories } from './chronos-app';
import { chronosAppRoutes, resolveChronosActionRouteContext } from './route-contract';

function createPostRequest(values: Record<string, string>): Request {
  const formData = new FormData();
  for (const [name, value] of Object.entries(values)) formData.set(name, value);
  return new Request('https://chronos.test/app/today', { method: 'POST', body: formData });
}

describe('Today quick-block route contract', () => {
  it('preserves a rejected quick-block draft without changing creation fields', async () => {
    const context = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: createPostRequest({
        action: 'create-planned-block',
        title: 'Late focus',
        category: 'home',
        date: '2026-07-14',
        startTime: '23:45',
        endTime: '23:59',
        feedbackOrigin: 'today-quick-block',
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositoryFactory: () => ({}) as ChronosAppRepositories,
      actionHandler: async () => {
        throw new Error('database unavailable');
      },
    });

    expect(context).toMatchObject({
      actionError: 'That change could not be saved. Check the form and try again.',
      actionDraft: {
        action: 'create-planned-block',
        title: 'Late focus',
        category: 'home',
        date: '2026-07-14',
        startTime: '23:45',
        endTime: '23:59',
      },
    });
  });
});
