import { describe, expect, it, vi } from 'vitest';

import type { ChronosAuthLocals } from './server/auth';

vi.mock('astro:middleware', () => ({
  defineMiddleware: (handler: unknown) => handler,
}));

vi.mock('./server/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./server/auth')>();

  return {
    ...actual,
    createChronosServerClient: vi.fn(actual.createChronosServerClient),
    createMockLocalAuthLocals: vi.fn(actual.createMockLocalAuthLocals),
  };
});

const auth = await import('./server/auth');
const { onRequest } = await import('./middleware');

describe('auth middleware', () => {
  it('redirects anonymous block navigation before page execution without writing cookies', async () => {
    const url = new URL('https://chronos.test/blocks/local-execution-block?view=notes');
    const request = new Request(url);
    const locals = {};
    const cookies = { set: vi.fn() };
    const getSession = vi.fn(async () => ({ data: { session: null }, error: null }));
    const getUser = vi.fn(async () => ({ data: { user: null }, error: null }));
    const supabase = { auth: { getSession, getUser } } as unknown as ReturnType<
      typeof auth.createChronosServerClient
    >;
    const createClient = vi.mocked(auth.createChronosServerClient);
    createClient.mockClear();
    createClient.mockReturnValueOnce(supabase);
    const next = vi.fn(async () => new Response('Protected page executed'));
    const redirect = vi.fn(
      (location: string, status: number) => new Response(null, { status, headers: { location } }),
    );

    const response = await onRequest(
      {
        url,
        request,
        locals,
        cookies,
        redirect,
        clientAddress: '192.0.2.1',
      } as unknown as Parameters<typeof onRequest>[0],
      next,
    );
    if (!(response instanceof Response)) throw new Error('Middleware did not return a response');

    const location = '/sign-in?redirectTo=%2Fblocks%2Flocal-execution-block%3Fview%3Dnotes';
    expect.soft(response.status).toBe(303);
    expect.soft(Object.fromEntries(response.headers)).toEqual({ location });
    expect.soft(await response.text()).toBe('');
    expect.soft(redirect).toHaveBeenCalledExactlyOnceWith(location, 303);
    expect.soft(next).not.toHaveBeenCalled();
    expect.soft(cookies.set).not.toHaveBeenCalled();
    expect(createClient).toHaveBeenCalledExactlyOnceWith(request, cookies);
    expect(getSession).toHaveBeenCalledOnce();
    expect(getUser).toHaveBeenCalledOnce();
    expect(locals).toEqual({ supabase, session: null, user: null });
  });

  it('wires the local dev auth bypass through onRequest for localhost loopback app requests', async () => {
    const locals = {};
    const response = new Response('ok');
    const next = vi.fn(async () => response);
    const url = new URL('http://localhost:4321/today');
    const createMockLocalAuthLocals = vi.mocked(auth.createMockLocalAuthLocals);

    createMockLocalAuthLocals.mockClear();

    await expect(
      onRequest(
        {
          url,
          request: new Request('http://localhost:4321/today'),
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
