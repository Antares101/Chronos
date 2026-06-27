import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const AUTH_CALLBACK_PATH = '/auth/callback';
const DEFAULT_APP_PATH = '/app';
const SIGN_IN_PATH = '/sign-in';
const REDIRECT_TO_PARAM = 'redirectTo';

type RequestCookie = {
  name: string;
  value: string;
};

export type ChronosAuthLocals = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
};

export type AuthMiddlewareDecision =
  { kind: 'continue' } | { kind: 'redirect'; location: string; status: 303 };

export type AuthCallbackExchange = (code: string) => Promise<{ error: unknown | null }>;

export type AuthCallbackDecision = {
  location: string;
  status: 303;
};

export type SignOutDecision = {
  location: string;
  status: 303;
};

export type SignInWithOtp = (parameters: {
  email: string;
  options: { emailRedirectTo: string };
}) => Promise<{ error: unknown | null }>;

export type SignInPostDecision = {
  errorMessage: string | null;
  message: string | null;
};

function requirePublicEnv(key: 'PUBLIC_SUPABASE_URL' | 'PUBLIC_SUPABASE_ANON_KEY'): string {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function parseCookieHeader(cookieHeader: string | null): RequestCookie[] {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const separatorIndex = cookie.indexOf('=');

      if (separatorIndex === -1) {
        return { name: cookie, value: '' };
      }

      return {
        name: cookie.slice(0, separatorIndex),
        value: safelyDecodeCookieValue(cookie.slice(separatorIndex + 1)),
      };
    });
}

function safelyDecodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function createChronosServerClient(request: Request, cookies: AstroCookies) {
  return createServerClient(
    requirePublicEnv('PUBLIC_SUPABASE_URL'),
    requirePublicEnv('PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: import.meta.env.PROD,
        // Chronos currently exchanges and refreshes auth server-side only, so auth cookies do not need browser JavaScript access.
        // If a future client-side Supabase auth client is introduced, revisit this before sharing the same cookie contract.
        httpOnly: true,
      },
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('cookie'));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options as CookieOptionsWithName);
          });
        },
      },
    },
  );
}

export function isProtectedAppPath(pathname: string): boolean {
  return pathname === DEFAULT_APP_PATH || pathname.startsWith(`${DEFAULT_APP_PATH}/`);
}

export function getSafeReturnPath(value: string | null, fallback = DEFAULT_APP_PATH): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  return value;
}

export function getRedirectTarget(url: URL, fallback = DEFAULT_APP_PATH): string {
  return getSafeReturnPath(url.searchParams.get(REDIRECT_TO_PARAM), fallback);
}

export function getPathWithSearch(url: URL): string {
  return `${url.pathname}${url.search}`;
}

export function createSignInUrl(currentUrl: URL, redirectTo = getPathWithSearch(currentUrl)): URL {
  const signInUrl = new URL(SIGN_IN_PATH, currentUrl);
  signInUrl.searchParams.set(REDIRECT_TO_PARAM, getSafeReturnPath(redirectTo));

  return signInUrl;
}

export function createSignInRedirect(currentUrl: URL): Response {
  const signInUrl = createSignInUrl(currentUrl);

  return Response.redirect(signInUrl, 303);
}

export function resolveAuthMiddlewareDecision(
  currentUrl: URL,
  user: User | null,
): AuthMiddlewareDecision {
  if (isProtectedAppPath(currentUrl.pathname) && !user) {
    return {
      kind: 'redirect',
      location: getPathWithSearch(createSignInUrl(currentUrl)),
      status: 303,
    };
  }

  return { kind: 'continue' };
}

export function getAuthCallbackUrl(
  currentUrl: URL,
  authRedirectOrigin = import.meta.env.PUBLIC_AUTH_REDIRECT_ORIGIN,
): string {
  const origin = authRedirectOrigin ?? currentUrl.origin;
  return new URL(AUTH_CALLBACK_PATH, origin).toString();
}

export function getAuthEmailRedirectUrl(
  currentUrl: URL,
  redirectTo: string,
  authRedirectOrigin = import.meta.env.PUBLIC_AUTH_REDIRECT_ORIGIN,
): string {
  const callbackUrl = new URL(getAuthCallbackUrl(currentUrl, authRedirectOrigin));
  callbackUrl.searchParams.set(REDIRECT_TO_PARAM, getSafeReturnPath(redirectTo));

  return callbackUrl.toString();
}

export async function resolveSignInPostDecision(
  currentUrl: URL,
  formData: FormData,
  signInWithOtp: SignInWithOtp,
  authRedirectOrigin = import.meta.env.PUBLIC_AUTH_REDIRECT_ORIGIN,
): Promise<SignInPostDecision> {
  const email = formData.get('email');
  const submittedRedirectTo = getSafeReturnPath(
    formData.get(REDIRECT_TO_PARAM)?.toString() ?? null,
  );

  if (typeof email !== 'string' || !email.trim()) {
    return {
      errorMessage: 'Enter an email address to continue.',
      message: null,
    };
  }

  const { error } = await signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: getAuthEmailRedirectUrl(currentUrl, submittedRedirectTo, authRedirectOrigin),
    },
  });

  if (error) {
    return {
      errorMessage: getAuthErrorMessage(error),
      message: null,
    };
  }

  return {
    errorMessage: null,
    message: 'Check your email for the sign-in link.',
  };
}

export async function resolveAuthCallbackDecision(
  url: URL,
  exchangeCodeForSession: AuthCallbackExchange,
): Promise<AuthCallbackDecision> {
  const code = url.searchParams.get('code');
  const redirectTo = getRedirectTarget(url);

  if (!code) {
    return createCallbackFailureDecision(url, redirectTo);
  }

  const { error } = await exchangeCodeForSession(code);

  if (error) {
    return createCallbackFailureDecision(url, redirectTo);
  }

  return { location: redirectTo, status: 303 };
}

function createCallbackFailureDecision(url: URL, redirectTo: string): AuthCallbackDecision {
  const signInUrl = createSignInUrl(url, redirectTo);
  signInUrl.searchParams.set('error', 'callback');

  return { location: getPathWithSearch(signInUrl), status: 303 };
}

export async function resolveSignOutDecision(
  signOut: () => Promise<unknown>,
): Promise<SignOutDecision> {
  await signOut();

  return { location: SIGN_IN_PATH, status: 303 };
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Authentication failed. Please try again.';
}
