import type { User } from '@supabase/supabase-js';

import { createSignInUrl, getPathWithSearch, isMockLocalUser } from '../auth';
import {
  getChronosAppStatusMessage,
  handleChronosAppAction,
  type ChronosAppActionResult,
  type ChronosAppActionStatus,
  type ChronosAppRepositories,
} from './chronos-app';
import { createMockLocalChronosAppRepositories } from './local-fixture';
import { createChronosAppRepositories } from './repositories';

export const chronosAppRoutes = {
  index: '/app',
  today: '/app/today',
  planning: '/app/planning',
  review: '/app/review',
  insights: '/app/insights',
} as const;

export const chronosAppSectionPaths = [
  chronosAppRoutes.today,
  chronosAppRoutes.planning,
  chronosAppRoutes.review,
  chronosAppRoutes.insights,
] as const;

export const chronosAppActionPaths = [
  chronosAppRoutes.today,
  chronosAppRoutes.planning,
  chronosAppRoutes.review,
] as const;

export type ChronosAppSectionPath = (typeof chronosAppSectionPaths)[number];
export type ChronosAppActionPath = (typeof chronosAppActionPaths)[number];
export type ChronosRouteUser = Pick<User, 'id' | 'email'> & {
  app_metadata?: User['app_metadata'];
};

export type ChronosRouteRedirectDecision = {
  kind: 'redirect';
  location: string;
  status: 302 | 303;
};

export type ChronosRouteAuthDecision =
  { kind: 'authenticated'; user: ChronosRouteUser; email: string } | ChronosRouteRedirectDecision;

export type ChronosRouteActionDecision =
  { kind: 'redirect'; location: string; status: 303 } | { kind: 'error'; message: string };

export type ChronosRouteActionHandler = (
  repositories: ChronosAppRepositories,
  userId: string,
  formData: FormData,
) => Promise<ChronosAppActionResult>;

export type ChronosRouteRepositoryFactory = (user: ChronosRouteUser) => ChronosAppRepositories;

export type ChronosActionRouteContext = {
  kind: 'ready';
  repositories: ChronosAppRepositories;
  userId: string;
  email: string;
  actionError: string | null;
  statusMessage: string | null;
};

export type ChronosReadRouteContext = {
  kind: 'ready';
  repositories: ChronosAppRepositories;
  userId: string;
  email: string;
};

export type ChronosActionRouteResolution = ChronosRouteRedirectDecision | ChronosActionRouteContext;
export type ChronosReadRouteResolution = ChronosRouteRedirectDecision | ChronosReadRouteContext;

const routeActionErrorMessage = 'The Chronos action could not be saved.';

export const chronosAppIndexRedirect = {
  kind: 'redirect',
  location: chronosAppRoutes.today,
  status: 302,
} as const satisfies ChronosRouteRedirectDecision;

export function resolveChronosAppIndexRedirect(): ChronosRouteRedirectDecision {
  return chronosAppIndexRedirect;
}

export function resolveChronosRouteAuth(
  user: ChronosRouteUser | null,
  currentUrl: URL,
  routePath: ChronosAppSectionPath,
): ChronosRouteAuthDecision {
  if (!user) {
    const signInUrl = createSignInUrl(currentUrl, `${routePath}${currentUrl.search}`);

    return { kind: 'redirect', location: getPathWithSearch(signInUrl), status: 303 };
  }

  return { kind: 'authenticated', user, email: user.email ?? 'Signed-in user' };
}

export function createChronosRouteRepositories(user?: ChronosRouteUser): ChronosAppRepositories {
  if (user && isMockLocalUser(user)) {
    return createMockLocalChronosAppRepositories(user.id);
  }

  return createChronosAppRepositories();
}

export function resolveChronosReadRouteContext({
  user,
  currentUrl,
  routePath,
  repositoryFactory = createChronosRouteRepositories,
}: {
  user: ChronosRouteUser | null;
  currentUrl: URL;
  routePath: ChronosAppSectionPath;
  repositoryFactory?: ChronosRouteRepositoryFactory;
}): ChronosReadRouteResolution {
  const authDecision = resolveChronosRouteAuth(user, currentUrl, routePath);

  if (authDecision.kind === 'redirect') {
    return authDecision;
  }

  return {
    kind: 'ready',
    repositories: repositoryFactory(authDecision.user),
    userId: authDecision.user.id,
    email: authDecision.email,
  };
}

export async function resolveChronosActionRouteContext({
  user,
  request,
  currentUrl,
  routePath,
  repositoryFactory = createChronosRouteRepositories,
  actionHandler = handleChronosAppAction,
}: {
  user: ChronosRouteUser | null;
  request: Request;
  currentUrl: URL;
  routePath: ChronosAppActionPath;
  repositoryFactory?: ChronosRouteRepositoryFactory;
  actionHandler?: ChronosRouteActionHandler;
}): Promise<ChronosActionRouteResolution> {
  const authDecision = resolveChronosRouteAuth(user, currentUrl, routePath);

  if (authDecision.kind === 'redirect') {
    return authDecision;
  }

  const repositories = repositoryFactory(authDecision.user);
  let actionError: string | null = null;
  const actionDecision = await resolveChronosRouteAction({
    request,
    currentUrl,
    routePath,
    repositories,
    userId: authDecision.user.id,
    actionHandler,
  });

  if (actionDecision?.kind === 'redirect') {
    return actionDecision;
  }

  if (actionDecision?.kind === 'error') {
    actionError = actionDecision.message;
  }

  return {
    kind: 'ready',
    repositories,
    userId: authDecision.user.id,
    email: authDecision.email,
    actionError,
    statusMessage: resolveChronosRouteStatusMessage(currentUrl, actionError),
  };
}

export async function resolveChronosRouteAction({
  request,
  currentUrl,
  routePath,
  repositories,
  userId,
  actionHandler = handleChronosAppAction,
}: {
  request: Request;
  currentUrl: URL;
  routePath: ChronosAppActionPath;
  repositories: ChronosAppRepositories;
  userId: string;
  actionHandler?: ChronosRouteActionHandler;
}): Promise<ChronosRouteActionDecision | null> {
  if (request.method !== 'POST') {
    return null;
  }

  try {
    const formData = await request.formData();
    const result = await actionHandler(repositories, userId, formData);

    return resolveChronosRouteActionRedirect(currentUrl, routePath, result.status);
  } catch (error) {
    return {
      kind: 'error',
      message: error instanceof Error ? error.message : routeActionErrorMessage,
    };
  }
}

export function resolveChronosRouteActionRedirect(
  currentUrl: URL,
  routePath: ChronosAppActionPath,
  status: ChronosAppActionStatus,
): ChronosRouteActionDecision {
  const nextUrl = new URL(routePath, currentUrl);
  nextUrl.searchParams.set('status', status);

  return { kind: 'redirect', location: getPathWithSearch(nextUrl), status: 303 };
}

export function resolveChronosRouteStatusMessage(
  currentUrl: URL,
  actionError: string | null,
): string | null {
  if (actionError) {
    return null;
  }

  return getChronosAppStatusMessage(currentUrl.searchParams.get('status'));
}
