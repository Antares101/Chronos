import { describe, expect, it } from 'vitest';

import { mockLocalUser } from '../auth';
import type { ChronosAppActionStatus, ChronosAppRepositories } from './chronos-app';
import {
  chronosAppActionPaths,
  chronosAppRoutes,
  chronosAppSectionPaths,
  chronosHomeRoute,
  createChronosRouteRepositories,
  resolveChronosActionRouteContext,
  resolveChronosAppIndexRedirect,
  resolveChronosHomeRedirect,
  resolveChronosReadRouteContext,
  resolveChronosRouteAction,
  resolveChronosRouteAuth,
  resolveChronosRouteStatusMessage,
  type ChronosAppActionPath,
  type ChronosRouteActionHandler,
} from './route-contract';

describe('Chronos app route contract', () => {
  it('redirects / home to the Today section', () => {
    expect(chronosHomeRoute).toBe('/');
    expect(resolveChronosHomeRedirect()).toEqual({
      kind: 'redirect',
      location: chronosAppRoutes.today,
      status: 302,
    });
  });

  it('redirects /app to the Today section', () => {
    expect(resolveChronosAppIndexRedirect()).toEqual({
      kind: 'redirect',
      location: chronosAppRoutes.today,
      status: 302,
    });
  });

  it('redirects unauthenticated section routes to sign-in with the section return path', () => {
    for (const routePath of chronosAppSectionPaths) {
      const decision = resolveChronosRouteAuth(
        null,
        new URL(`https://chronos.test${routePath}`),
        routePath,
      );

      expect(decision).toEqual({
        kind: 'redirect',
        location: `/sign-in?redirectTo=${encodeURIComponent(routePath)}`,
        status: 303,
      });
    }
  });

  it('exposes the configured app section route paths', () => {
    expect(chronosAppSectionPaths).toEqual([
      chronosAppRoutes.today,
      chronosAppRoutes.planning,
      chronosAppRoutes.review,
      chronosAppRoutes.insights,
    ]);
  });

  it('preserves section query parameters in unauthenticated sign-in redirects', () => {
    const decision = resolveChronosRouteAuth(
      null,
      new URL('https://chronos.test/app/today?status=started'),
      chronosAppRoutes.today,
    );

    expect(decision).toEqual({
      kind: 'redirect',
      location: '/sign-in?redirectTo=%2Fapp%2Ftoday%3Fstatus%3Dstarted',
      status: 303,
    });
  });

  it('keeps authenticated section routes on the requested route', () => {
    const decision = resolveChronosRouteAuth(
      { id: 'user-1', email: 'user@chronos.test' },
      new URL('https://chronos.test/app/today'),
      chronosAppRoutes.today,
    );

    expect(decision).toEqual({
      kind: 'authenticated',
      user: { id: 'user-1', email: 'user@chronos.test' },
      email: 'user@chronos.test',
    });
  });

  it('falls back to signed-in user copy when authenticated email is unavailable', () => {
    const decision = resolveChronosRouteAuth(
      { id: 'user-1', email: undefined },
      new URL('https://chronos.test/app/today'),
      chronosAppRoutes.today,
    );

    expect(decision.kind).toBe('authenticated');
    if (decision.kind === 'authenticated') {
      expect(decision.email).toBe('Signed-in user');
    }
  });

  it('does not delegate actions for non-POST route requests', async () => {
    let delegated = false;

    const decision = await resolveChronosRouteAction({
      request: new Request('https://chronos.test/app/today'),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositories: fakeRepositories(),
      userId: 'user-1',
      actionHandler: async () => {
        delegated = true;
        return { status: 'started' };
      },
    });

    expect(decision).toBeNull();
    expect(delegated).toBe(false);
  });

  it('resolves authenticated GET route setup without delegating actions', async () => {
    const repositories = fakeRepositories();
    let delegated = false;

    const context = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: new Request('https://chronos.test/app/today?status=started'),
      currentUrl: new URL('https://chronos.test/app/today?status=started'),
      routePath: chronosAppRoutes.today,
      repositoryFactory: () => repositories,
      actionHandler: async () => {
        delegated = true;
        return { status: 'started' };
      },
    });

    expect(context).toEqual({
      kind: 'ready',
      repositories,
      userId: 'user-1',
      email: 'user@chronos.test',
      actionError: null,
      statusMessage: 'Block started.',
    });
    expect(delegated).toBe(false);
  });

  it('returns unauthenticated route redirects before creating repositories', async () => {
    let repositoryCreated = false;

    const context = await resolveChronosActionRouteContext({
      user: null,
      request: new Request('https://chronos.test/app/review'),
      currentUrl: new URL('https://chronos.test/app/review'),
      routePath: chronosAppRoutes.review,
      repositoryFactory: () => {
        repositoryCreated = true;
        return fakeRepositories();
      },
    });

    expect(context).toEqual({
      kind: 'redirect',
      location: `/sign-in?redirectTo=${encodeURIComponent(chronosAppRoutes.review)}`,
      status: 303,
    });
    expect(repositoryCreated).toBe(false);
  });

  it('returns unauthenticated read route redirects before creating repositories', () => {
    let repositoryCreated = false;

    const context = resolveChronosReadRouteContext({
      user: null,
      currentUrl: new URL('https://chronos.test/app/insights'),
      routePath: chronosAppRoutes.insights,
      repositoryFactory: () => {
        repositoryCreated = true;
        return fakeRepositories();
      },
    });

    expect(context).toEqual({
      kind: 'redirect',
      location: `/sign-in?redirectTo=${encodeURIComponent(chronosAppRoutes.insights)}`,
      status: 303,
    });
    expect(repositoryCreated).toBe(false);
  });

  it('resolves authenticated read routes with injected repositories', () => {
    const repositories = fakeRepositories();

    const context = resolveChronosReadRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      currentUrl: new URL('https://chronos.test/app/insights'),
      routePath: chronosAppRoutes.insights,
      repositoryFactory: () => repositories,
    });

    expect(context).toEqual({
      kind: 'ready',
      repositories,
      userId: 'user-1',
      email: 'user@chronos.test',
    });
  });

  it('uses deterministic local fixture repositories for the mock local user', async () => {
    const context = resolveChronosReadRouteContext({
      user: mockLocalUser,
      currentUrl: new URL('http://localhost:4321/app/insights'),
      routePath: chronosAppRoutes.insights,
      repositoryFactory: createChronosRouteRepositories,
    });

    expect(context.kind).toBe('ready');

    if (context.kind !== 'ready') {
      throw new Error('Expected local fixture route context to be ready.');
    }

    await expect(context.repositories.blocks.listForUser(mockLocalUser.id)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'local-planning-block', userId: mockLocalUser.id }),
        expect.objectContaining({ id: 'local-execution-block', userId: mockLocalUser.id }),
      ]),
    );
    await expect(context.repositories.tasks.listForUser(mockLocalUser.id)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'local-unassigned-task', blockId: null }),
      ]),
    );
  });

  it('keeps safe route action errors in the resolved route setup', async () => {
    const context = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: createPostRequest('https://chronos.test/app/planning', {
        action: 'create-planned-block',
      }),
      currentUrl: new URL('https://chronos.test/app/planning?status=created'),
      routePath: chronosAppRoutes.planning,
      repositoryFactory: fakeRepositories,
      actionHandler: async () => {
        throw new Error('Schedule date must use YYYY-MM-DD format.');
      },
    });

    expect(context).toMatchObject({
      kind: 'ready',
      userId: 'user-1',
      email: 'user@chronos.test',
      actionError: 'That change could not be saved. Check the form and try again.',
      statusMessage: null,
    });
  });

  it.each([
    [chronosAppRoutes.today, 'start-block', 'started'],
    [chronosAppRoutes.planning, 'create-planned-block', 'created'],
    [chronosAppRoutes.review, 'conclude-block', 'concluded'],
    [chronosAppRoutes.today, 'conclude-block-without-review', 'block-concluded'],
  ] satisfies [ChronosAppActionPath, string, ChronosAppActionStatus][])(
    'delegates POST actions on %s and redirects back to that route on success',
    async (routePath, action, status) => {
      const repositories = fakeRepositories();
      const delegated: Array<{
        repositories: ChronosAppRepositories;
        userId: string;
        action: FormDataEntryValue | null;
      }> = [];
      const actionHandler: ChronosRouteActionHandler = async (
        receivedRepositories,
        userId,
        formData,
      ) => {
        delegated.push({
          repositories: receivedRepositories,
          userId,
          action: formData.get('action'),
        });

        return { status };
      };

      const decision = await resolveChronosRouteAction({
        request: createPostRequest(`https://chronos.test${routePath}`, { action }),
        currentUrl: new URL(`https://chronos.test${routePath}?status=old`),
        routePath,
        repositories,
        userId: 'user-1',
        actionHandler,
      });

      expect(delegated).toEqual([{ repositories, userId: 'user-1', action }]);
      expect(decision).toEqual({
        kind: 'redirect',
        location: `${routePath}?status=${status}`,
        status: 303,
      });
    },
  );

  it('routes no-review conclusion with only blockId and direct success status', async () => {
    const repositories = fakeRepositories();
    const receivedFields: Array<[string, FormDataEntryValue]> = [];
    const decision = await resolveChronosRouteAction({
      request: createPostRequest('https://chronos.test/app/today', {
        action: 'conclude-block-without-review',
        blockId: 'block-1',
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositories,
      userId: 'user-1',
      actionHandler: async (_repositories, _userId, formData) => {
        receivedFields.push(...formData.entries());
        return { status: 'block-concluded' };
      },
    });

    expect(receivedFields).toEqual([
      ['action', 'conclude-block-without-review'],
      ['blockId', 'block-1'],
    ]);
    expect(decision).toEqual({
      kind: 'redirect',
      location: '/app/today?status=block-concluded',
      status: 303,
    });
  });

  it('carries the close-review origin through success and failed Today conclusion handling', async () => {
    const repositories = fakeRepositories();
    const post = await resolveChronosRouteAction({
      request: createPostRequest('https://chronos.test/app/today', {
        action: 'conclude-block-without-review',
        blockId: 'block-1',
        feedbackOrigin: 'today-close-review',
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositories,
      userId: 'user-1',
      actionHandler: async () => ({ status: 'block-concluded' }),
    });
    expect(post).toEqual({
      kind: 'redirect',
      location: '/app/today?status=block-concluded&feedbackOrigin=today-close-review',
      status: 303,
    });

    const failed = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: createPostRequest('https://chronos.test/app/today', {
        action: 'conclude-block',
        blockId: 'block-1',
        notes: 'Review failed.',
        feedbackOrigin: 'today-close-review',
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositoryFactory: () => repositories,
      actionHandler: async () => {
        throw new Error('review persistence unavailable');
      },
    });
    expect(failed).toMatchObject({
      kind: 'ready',
      actionError: 'That change could not be saved. Check the form and try again.',
      feedbackOrigin: 'today-close-review',
    });
    expect(failed).not.toHaveProperty('actionDraft');
  });

  it('carries only an allowlisted task feedback origin through POST redirect and GET context', async () => {
    const repositories = fakeRepositories();
    const post = await resolveChronosRouteAction({
      request: createPostRequest('https://chronos.test/app/today', {
        action: 'create-task',
        blockId: 'block-1',
        title: 'Capture a note',
        feedbackOrigin: 'today-day-sheet',
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositories,
      userId: 'user-1',
      actionHandler: async () => ({ status: 'task-created', destination: 'block:block-1' }),
    });

    expect(post).toEqual({
      kind: 'redirect',
      location:
        '/app/today?status=task-created&destination=block%3Ablock-1&feedbackOrigin=today-day-sheet',
      status: 303,
    });
    if (post?.kind !== 'redirect') throw new Error('Expected a task creation redirect.');

    const get = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: new Request(`https://chronos.test${post.location}`),
      currentUrl: new URL(`https://chronos.test${post.location}`),
      routePath: chronosAppRoutes.today,
      repositoryFactory: () => repositories,
    });
    expect(get).toMatchObject({
      kind: 'ready',
      feedbackOrigin: 'today-day-sheet',
    });

    const untrusted = await resolveChronosRouteAction({
      request: createPostRequest('https://chronos.test/app/today', {
        action: 'create-task',
        blockId: 'block-1',
        title: 'Capture a note',
        feedbackOrigin: '<img src=x onerror=alert(1)>',
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositories,
      userId: 'user-1',
      actionHandler: async () => ({ status: 'task-created' }),
    });
    expect(untrusted).toEqual({
      kind: 'redirect',
      location: '/app/today?status=task-created',
      status: 303,
    });
  });

  it('carries the Today inbox origin through assignment redirect and GET context', async () => {
    const repositories = fakeRepositories();
    const post = await resolveChronosRouteAction({
      request: createPostRequest('https://chronos.test/app/today', {
        action: 'assign-task',
        taskId: 'task-1',
        blockId: 'block-1',
        feedbackOrigin: 'today-inbox',
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositories,
      userId: 'user-1',
      actionHandler: async () => ({ status: 'assigned' }),
    });

    expect(post).toEqual({
      kind: 'redirect',
      location: '/app/today?status=assigned&feedbackOrigin=today-inbox',
      status: 303,
    });
    if (post?.kind !== 'redirect') throw new Error('Expected an assignment redirect.');

    const get = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: new Request(`https://chronos.test${post.location}`),
      currentUrl: new URL(`https://chronos.test${post.location}`),
      routePath: chronosAppRoutes.today,
      repositoryFactory: () => repositories,
    });
    expect(get).toMatchObject({ kind: 'ready', feedbackOrigin: 'today-inbox' });
  });

  it('preserves an assignment draft for Today-scoped retry feedback', async () => {
    const context = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: createPostRequest('https://chronos.test/app/today', {
        action: 'assign-task',
        taskId: 'task-1',
        blockId: 'stale-block',
        feedbackOrigin: 'today-inbox',
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositoryFactory: fakeRepositories,
      actionHandler: async () => {
        throw new Error('Block was not found.');
      },
    });

    expect(context).toMatchObject({
      actionError: 'That change could not be saved. Check the form and try again.',
      actionDraft: { action: 'assign-task', taskId: 'task-1', blockId: 'stale-block' },
    });
  });

  it('returns safe route action copy instead of redirecting when POST delegation fails', async () => {
    const decision = await resolveChronosRouteAction({
      request: createPostRequest('https://chronos.test/app/planning', {
        action: 'create-planned-block',
      }),
      currentUrl: new URL('https://chronos.test/app/planning?status=created'),
      routePath: chronosAppRoutes.planning,
      repositories: fakeRepositories(),
      userId: 'user-1',
      actionHandler: async () => {
        throw new Error('Schedule date must use YYYY-MM-DD format.');
      },
    });

    expect(decision).toEqual({
      kind: 'error',
      message: 'That change could not be saved. Check the form and try again.',
    });
    expect(
      resolveChronosRouteStatusMessage(
        new URL('https://chronos.test/app/planning?status=created'),
        'That change could not be saved. Check the form and try again.',
      ),
    ).toBeNull();
  });

  it('returns a generic error without a draft when form data is unreadable', async () => {
    const unreadable = {
      method: 'POST',
      clone: () => ({ formData: async () => Promise.reject(new Error('unreadable')) }),
      formData: async () => Promise.reject(new Error('unreadable')),
    } as unknown as Request;

    await expect(
      resolveChronosRouteAction({
        request: unreadable,
        currentUrl: new URL('https://chronos.test/app/today'),
        routePath: chronosAppRoutes.today,
        repositories: fakeRepositories(),
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      kind: 'error',
      message: 'That change could not be saved. Check the form and try again.',
    });
  });

  it.each([
    [
      'create-highlighted-event',
      { blockId: 'block-1', title: '  Resolved blocker  ', ignored: 'forged' },
    ],
    ['create-task', { blockId: 'block-1', title: '  Follow up  ', ignored: 'forged' }],
  ] as const)(
    'does not create a retry draft when the non-idempotent %s action fails',
    async (action, values) => {
      const context = await resolveChronosActionRouteContext({
        user: { id: 'user-1', email: 'user@chronos.test' },
        request: createPostRequest('https://chronos.test/app/today', { action, ...values }),
        currentUrl: new URL('https://chronos.test/app/today'),
        routePath: chronosAppRoutes.today,
        repositoryFactory: fakeRepositories,
        actionHandler: async () => {
          throw new Error('database secret');
        },
      });

      expect(context).toMatchObject({
        actionError: 'That change could not be saved. Check the form and try again.',
      });
      expect(context).not.toHaveProperty('actionDraft');
    },
  );

  it.each([
    [
      'log-pause',
      { blockId: 'block-1', pauseKind: 'untimed', note: '  Take a walk  ', ignored: 'forged' },
    ],
    [
      'conclude-block',
      {
        blockId: 'block-1',
        completedTaskIds: ['task-1', 'task-2'],
        notes: '  Wrapped up  ',
        nextAdjustment: '  Start earlier  ',
        ignored: 'forged',
      },
    ],
    ['conclude-block-without-review', { blockId: 'block-1' }],
  ] as const)(
    'does not create a retry draft when the non-transactional %s action fails',
    async (action, values) => {
      const context = await resolveChronosActionRouteContext({
        user: { id: 'user-1', email: 'user@chronos.test' },
        request: createPostRequest('https://chronos.test/app/today', { action, ...values }),
        currentUrl: new URL('https://chronos.test/app/today'),
        routePath: chronosAppRoutes.today,
        repositoryFactory: fakeRepositories,
        actionHandler: async () => {
          throw new Error('database secret');
        },
      });

      expect(context).toMatchObject({
        kind: 'ready',
        userId: 'user-1',
        email: 'user@chronos.test',
        actionError: 'That change could not be saved. Check the form and try again.',
        statusMessage: null,
      });
      expect(context).not.toHaveProperty('actionDraft');
    },
  );

  it('keeps every submitted Today goal in order when saving goals fails', async () => {
    const context = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: createPostRequest('https://chronos.test/app/today', {
        action: 'today-save-goals',
        goals: ['Finish recovery flow', 'Check accessible feedback', 'Ship the fix'],
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositoryFactory: fakeRepositories,
      actionHandler: async () => {
        throw new Error('goals database secret');
      },
    });

    expect(context).toMatchObject({
      actionError: 'That change could not be saved. Check the form and try again.',
      actionDraft: {
        action: 'today-save-goals',
        goals: ['Finish recovery flow', 'Check accessible feedback', 'Ship the fix'],
      },
    });
  });

  it('allowlists failed Today drafts and derives task confirmation from fresh owned state', async () => {
    const repositories = fakeRepositories();
    repositories.blocks = {
      findById: async () => ({ title: 'Fresh label' }) as never,
    } as unknown as ChronosAppRepositories['blocks'];

    const failure = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: createPostRequest('https://chronos.test/app/today', {
        action: 'today-create-task',
        title: '  Retry me  ',
        destination: 'block:owned',
        destinationLabel: 'Forged label',
        userId: 'user-2',
      }),
      currentUrl: new URL('https://chronos.test/app/today'),
      routePath: chronosAppRoutes.today,
      repositoryFactory: () => repositories,
      actionHandler: async () => {
        throw new Error('title database secret');
      },
    });
    expect(failure).toMatchObject({
      actionError: 'That change could not be saved. Check the form and try again.',
      actionDraft: {
        action: 'today-create-task',
        title: 'Retry me',
        destination: 'block:owned',
      },
    });
    const successUrl =
      'https://chronos.test/app/today?status=task-created&destination=block%3Aowned';
    const success = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: new Request(successUrl),
      currentUrl: new URL(successUrl),
      routePath: chronosAppRoutes.today,
      repositoryFactory: () => repositories,
    });
    expect(success).toMatchObject({ statusMessage: 'Task added to Fresh label.' });

    repositories.blocks.findById = async () => {
      throw new Error('lookup unavailable');
    };
    let writes = 0;
    const unavailable = await resolveChronosActionRouteContext({
      user: { id: 'user-1', email: 'user@chronos.test' },
      request: new Request(successUrl),
      currentUrl: new URL(successUrl),
      routePath: chronosAppRoutes.today,
      repositoryFactory: () => repositories,
      actionHandler: async () => {
        writes += 1;
        return { status: 'task-created' };
      },
    });
    expect(unavailable).toMatchObject({ statusMessage: 'Task added.' });
    expect(writes).toBe(0);
  });

  it('exposes the configured POST-capable section routes', () => {
    expect(chronosAppActionPaths).toEqual([
      chronosAppRoutes.today,
      chronosAppRoutes.planning,
      chronosAppRoutes.review,
    ]);
  });
});

function createPostRequest(
  url: string,
  values: Record<string, string | readonly string[]>,
): Request {
  const formData = new FormData();

  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== 'string') {
      for (const entry of value) formData.append(name, entry);
    } else {
      formData.set(name, value);
    }
  }

  return new Request(url, { method: 'POST', body: formData });
}

function fakeRepositories(): ChronosAppRepositories {
  return {} as ChronosAppRepositories;
}
