import type { User } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { GET as authCallbackGet } from '../pages/auth/callback';
import { POST as signOutPost } from '../pages/sign-out';

import {
  createMockLocalAuthLocals,
  createSignInUrl,
  getAuthCallbackUrl,
  getAuthEmailRedirectUrl,
  getAuthErrorMessage,
  getRedirectTarget,
  getSafeReturnPath,
  isLocalhostDevRequest,
  isLoopbackClientAddress,
  isProtectedAppPath,
  mockLocalSession,
  mockLocalUser,
  parseCookieHeader,
  resolveAuthCallbackDecision,
  resolveAuthMiddlewareDecision,
  resolveSignInPostDecision,
  resolveSignOutDecision,
  type ChronosAuthLocals,
} from './auth';

describe('auth route helpers', () => {
  it('classifies only the app shell as protected', () => {
    expect(isProtectedAppPath('/app')).toBe(true);
    expect(isProtectedAppPath('/app/blocks')).toBe(true);
    expect(isProtectedAppPath('/')).toBe(false);
    expect(isProtectedAppPath('/sign-in')).toBe(false);
    expect(isProtectedAppPath('/application')).toBe(false);
  });

  it('redirects unauthenticated app requests to sign-in with the app target preserved', () => {
    const decision = resolveAuthMiddlewareDecision(
      new URL('https://chronos.test/app?day=today'),
      null,
    );

    expect(decision).toEqual({
      kind: 'redirect',
      location: '/sign-in?redirectTo=%2Fapp%3Fday%3Dtoday',
      status: 303,
    });
  });

  it('does not protect public routes or authenticated app routes', () => {
    const user = { id: 'user-1' } as User;

    expect(resolveAuthMiddlewareDecision(new URL('https://chronos.test/sign-in'), null)).toEqual({
      kind: 'continue',
    });
    expect(
      resolveAuthMiddlewareDecision(new URL('https://chronos.test/auth/callback'), null),
    ).toEqual({
      kind: 'continue',
    });
    expect(resolveAuthMiddlewareDecision(new URL('https://chronos.test/app'), user)).toEqual({
      kind: 'continue',
    });
  });

  it('classifies loopback client addresses only for trusted local clients', () => {
    expect(isLoopbackClientAddress('127.0.0.1')).toBe(true);
    expect(isLoopbackClientAddress('127.10.20.30')).toBe(true);
    expect(isLoopbackClientAddress('::1')).toBe(true);
    expect(isLoopbackClientAddress('::ffff:127.0.0.1')).toBe(true);
    expect(isLoopbackClientAddress('192.168.1.10')).toBe(false);
    expect(isLoopbackClientAddress('localhost')).toBe(false);
    expect(isLoopbackClientAddress('')).toBe(false);
    expect(isLoopbackClientAddress(undefined)).toBe(false);
  });

  it('classifies localhost development requests only with dev, local hostname, and loopback client address', () => {
    expect(isLocalhostDevRequest(new URL('http://localhost:4321/app'), true, '127.0.0.1')).toBe(
      true,
    );
    expect(isLocalhostDevRequest(new URL('http://127.0.0.1:4321/app'), true, '127.0.0.1')).toBe(
      true,
    );
    expect(isLocalhostDevRequest(new URL('http://[::1]:4321/app'), true, '::1')).toBe(true);
    expect(isLocalhostDevRequest(new URL('http://localhost:4321/app'), true, '192.168.1.10')).toBe(
      false,
    );
    expect(isLocalhostDevRequest(new URL('http://localhost:4321/app'), true)).toBe(false);
    expect(isLocalhostDevRequest(new URL('http://localhost:4321/app'), false, '127.0.0.1')).toBe(
      false,
    );
    expect(isLocalhostDevRequest(new URL('http://192.168.1.10:4321/app'), true, '127.0.0.1')).toBe(
      false,
    );
    expect(isLocalhostDevRequest(new URL('https://chronos.test/app'), true, '127.0.0.1')).toBe(
      false,
    );
  });

  it('creates deterministic mock auth locals only for protected localhost dev app routes', async () => {
    const locals = createMockLocalAuthLocals(
      new URL('http://localhost:4321/app/today'),
      true,
      '127.0.0.1',
    );

    expect(locals?.user).toBe(mockLocalUser);
    expect(mockLocalUser.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(locals?.session).toBe(mockLocalSession);
    await expect(locals?.supabase.auth.getSession()).resolves.toEqual({
      data: { session: mockLocalSession },
      error: null,
    });
    await expect(locals?.supabase.auth.getUser()).resolves.toEqual({
      data: { user: mockLocalUser },
      error: null,
    });

    expect(
      createMockLocalAuthLocals(new URL('http://localhost:4321/sign-in'), true, '127.0.0.1'),
    ).toBeNull();
    expect(
      createMockLocalAuthLocals(new URL('http://localhost:4321/app'), true, '192.168.1.10'),
    ).toBeNull();
    expect(createMockLocalAuthLocals(new URL('http://localhost:4321/app'), true)).toBeNull();
    expect(
      createMockLocalAuthLocals(new URL('http://localhost:4321/app'), false, '127.0.0.1'),
    ).toBeNull();
    expect(
      createMockLocalAuthLocals(new URL('http://chronos.test/app'), true, '127.0.0.1'),
    ).toBeNull();
  });

  it('allows only same-origin return paths', () => {
    expect(getSafeReturnPath('/app?day=today')).toBe('/app?day=today');
    expect(getSafeReturnPath('https://example.com/app')).toBe('/app');
    expect(getSafeReturnPath('//example.com/app')).toBe('/app');
    expect(getSafeReturnPath(null)).toBe('/app');
  });

  it('reads the redirect target from the redirectTo query parameter only after sanitizing it', () => {
    expect(getRedirectTarget(new URL('https://chronos.test/sign-in?redirectTo=/app/blocks'))).toBe(
      '/app/blocks',
    );
    expect(
      getRedirectTarget(new URL('https://chronos.test/sign-in?redirectTo=https://evil.test/app')),
    ).toBe('/app');
  });

  it('constructs safe sign-in and magic-link callback redirect URLs', () => {
    const appUrl = new URL('https://chronos.test/app?day=today');
    const signInUrl = createSignInUrl(appUrl);

    expect(signInUrl.pathname).toBe('/sign-in');
    expect(signInUrl.searchParams.get('redirectTo')).toBe('/app?day=today');

    const unsafeSignInUrl = createSignInUrl(appUrl, 'https://evil.test/app');
    expect(unsafeSignInUrl.searchParams.get('redirectTo')).toBe('/app');

    const emailRedirectUrl = new URL(
      getAuthEmailRedirectUrl(appUrl, '/app/blocks', 'https://chronos.test'),
    );
    expect(emailRedirectUrl.origin).toBe('https://chronos.test');
    expect(emailRedirectUrl.pathname).toBe('/auth/callback');
    expect(emailRedirectUrl.searchParams.get('redirectTo')).toBe('/app/blocks');
  });

  it('constructs callback URLs from injected origins so ambient env cannot change expectations', () => {
    expect(
      getAuthCallbackUrl(new URL('https://chronos.test/sign-in'), 'https://auth.chronos.test'),
    ).toBe('https://auth.chronos.test/auth/callback');

    const emailRedirectUrl = new URL(
      getAuthEmailRedirectUrl(
        new URL('https://chronos.test/sign-in'),
        '/app',
        'http://localhost:4321',
      ),
    );

    expect(emailRedirectUrl.origin).toBe('http://localhost:4321');
    expect(emailRedirectUrl.pathname).toBe('/auth/callback');
    expect(emailRedirectUrl.searchParams.get('redirectTo')).toBe('/app');
  });

  it('normalizes unknown auth errors', () => {
    expect(getAuthErrorMessage(new Error('Invalid login credentials'))).toBe(
      'Invalid login credentials',
    );
    expect(getAuthErrorMessage('nope')).toBe('Authentication failed. Please try again.');
  });

  it('parses request cookies for the Supabase SSR adapter', () => {
    expect(parseCookieHeader('sb-token=abc%20123; theme=dark')).toEqual([
      { name: 'sb-token', value: 'abc 123' },
      { name: 'theme', value: 'dark' },
    ]);
    expect(parseCookieHeader(null)).toEqual([]);
  });

  it('keeps malformed percent-encoded cookie values instead of throwing', () => {
    expect(parseCookieHeader('sb-token=%E0%A4%A; theme=dark')).toEqual([
      { name: 'sb-token', value: '%E0%A4%A' },
      { name: 'theme', value: 'dark' },
    ]);
  });

  it('redirects callback success to the sanitized redirect target', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({ error: null }));

    await expect(
      resolveAuthCallbackDecision(
        new URL('https://chronos.test/auth/callback?code=abc&redirectTo=/app/blocks'),
        exchangeCodeForSession,
      ),
    ).resolves.toEqual({ location: '/app/blocks', status: 303 });
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
  });

  it('redirects callback failures back to sign-in with a sanitized redirect target', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({
      error: new Error('expired'),
    }));

    await expect(
      resolveAuthCallbackDecision(
        new URL('https://chronos.test/auth/callback?code=abc&redirectTo=https://evil.test/app'),
        exchangeCodeForSession,
      ),
    ).resolves.toEqual({
      location: '/sign-in?redirectTo=%2Fapp&error=callback',
      status: 303,
    });
  });

  it('redirects callback requests without a code through the failure contract', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({ error: null }));

    await expect(
      resolveAuthCallbackDecision(
        new URL('https://chronos.test/auth/callback?redirectTo=/app'),
        exchangeCodeForSession,
      ),
    ).resolves.toEqual({
      location: '/sign-in?redirectTo=%2Fapp&error=callback',
      status: 303,
    });
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('validates empty sign-in email submissions without calling Supabase', async () => {
    const signInWithOtp = vi.fn(async () => ({ error: null }));
    const formData = new FormData();
    formData.set('email', '   ');
    formData.set('redirectTo', '/app');

    await expect(
      resolveSignInPostDecision(
        new URL('https://chronos.test/sign-in'),
        formData,
        signInWithOtp,
        'https://chronos.test',
      ),
    ).resolves.toEqual({
      errorMessage: 'Enter an email address to continue.',
      message: null,
    });
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it('requests a magic link with a sanitized callback URL on sign-in success', async () => {
    const signInWithOtp = vi.fn(async () => ({ error: null }));
    const formData = new FormData();
    formData.set('email', '  user@example.com  ');
    formData.set('redirectTo', 'https://evil.test/app');

    await expect(
      resolveSignInPostDecision(
        new URL('https://chronos.test/sign-in'),
        formData,
        signInWithOtp,
        'https://auth.chronos.test',
      ),
    ).resolves.toEqual({
      errorMessage: null,
      message: 'Check your email for the sign-in link.',
    });

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'user@example.com',
      options: {
        emailRedirectTo: 'https://auth.chronos.test/auth/callback?redirectTo=%2Fapp',
      },
    });
  });

  it('returns Supabase sign-in errors without live Supabase', async () => {
    const signInWithOtp = vi.fn(async () => ({ error: new Error('Rate limited') }));
    const formData = new FormData();
    formData.set('email', 'user@example.com');
    formData.set('redirectTo', '/app/blocks');

    await expect(
      resolveSignInPostDecision(
        new URL('https://chronos.test/sign-in'),
        formData,
        signInWithOtp,
        'https://chronos.test',
      ),
    ).resolves.toEqual({
      errorMessage: 'Rate limited',
      message: null,
    });
    expect(signInWithOtp).toHaveBeenCalledOnce();
  });

  it('wires the callback route to the Supabase exchange contract without live Supabase', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({ error: null }));
    const redirect = vi.fn((location: string, status: number) =>
      Response.redirect(new URL(location, 'https://chronos.test'), status),
    );

    await authCallbackGet({
      locals: {
        supabase: { auth: { exchangeCodeForSession } },
      } as unknown as ChronosAuthLocals,
      redirect,
      url: new URL('https://chronos.test/auth/callback?code=abc&redirectTo=/app'),
    } as unknown as Parameters<typeof authCallbackGet>[0]);

    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
    expect(redirect).toHaveBeenCalledWith('/app', 303);
  });

  it('signs out through Supabase and redirects safely to sign-in', async () => {
    const signOut = vi.fn(async () => undefined);

    await expect(resolveSignOutDecision(signOut)).resolves.toEqual({
      location: '/sign-in',
      status: 303,
    });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it('wires the sign-out route to Supabase without live Supabase', async () => {
    const signOut = vi.fn(async () => undefined);
    const redirect = vi.fn((location: string, status: number) =>
      Response.redirect(new URL(location, 'https://chronos.test'), status),
    );

    await signOutPost({
      locals: {
        supabase: { auth: { signOut } },
      } as unknown as ChronosAuthLocals,
      redirect,
    } as unknown as Parameters<typeof signOutPost>[0]);

    expect(signOut).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith('/sign-in', 303);
  });
});
