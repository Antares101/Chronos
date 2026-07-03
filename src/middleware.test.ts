import { describe, expect, it, vi } from 'vitest';

import type { ChronosAuthLocals } from './server/auth';

vi.mock('astro:middleware', () => ({
  defineMiddleware: (handler: unknown) => handler,
}));

vi.mock('./server/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./server/auth')>();

  return {
    ...actual,
    createMockLocalAuthLocals: vi.fn(actual.createMockLocalAuthLocals),
  };
});

const auth = await import('./server/auth');
const { onRequest } = await import('./middleware');

describe('auth middleware', () => {
  it('wires the local dev auth bypass through onRequest for localhost loopback app requests', async () => {
    const locals = {};
    const response = new Response('ok');
    const next = vi.fn(async () => response);
    const url = new URL('http://localhost:4321/app');
    const createMockLocalAuthLocals = vi.mocked(auth.createMockLocalAuthLocals);

    createMockLocalAuthLocals.mockClear();

    await expect(
      onRequest(
        {
          url,
          request: new Request('http://localhost:4321/app'),
          locals,
          clientAddress: '127.0.0.1',
        } as unknown as Parameters<typeof onRequest>[0],
        next,
      ),
    ).resolves.toBe(response);

    expect(createMockLocalAuthLocals).toHaveBeenCalledWith(url, true, '127.0.0.1');
    expect(next).toHaveBeenCalledOnce();
    expect((locals as ChronosAuthLocals).user).toBe(auth.mockLocalUser);
    expect((locals as ChronosAuthLocals).session).toBe(auth.mockLocalSession);
    await expect((locals as ChronosAuthLocals).supabase.auth.getUser()).resolves.toEqual({
      data: { user: auth.mockLocalUser },
      error: null,
    });
  });
});
