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

export type TodayActionDraft =
  | { action: 'today-save-daily-header'; focus: string; constraints: string }
  | { action: 'today-create-task'; title: string; destination: string }
  | { action: 'today-save-closeout'; outcome: string; tomorrowAdjustment: string }
  | { action: 'today-save-goals'; goals: string[] }
  | { action: 'assign-task'; taskId: string; blockId: string }
  | {
      action: 'create-planned-block';
      title: string;
      category: string;
      date: string;
      startTime: string;
      endTime: string;
    };
export type TodayFeedbackOrigin =
  'today-day-sheet' | 'today-inbox' | 'today-quick-block' | 'today-close-review';

export type ChronosRouteActionDecision =
  | { kind: 'redirect'; location: string; status: 303 }
  | {
      kind: 'error';
      message: string;
      feedbackOrigin?: TodayFeedbackOrigin;
      actionDraft?: TodayActionDraft;
    };

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
  feedbackOrigin?: TodayFeedbackOrigin;
  actionDraft?: TodayActionDraft;
};

export type ChronosReadRouteContext = {
  kind: 'ready';
  repositories: ChronosAppRepositories;
  userId: string;
  email: string;
};

export type ChronosActionRouteResolution = ChronosRouteRedirectDecision | ChronosActionRouteContext;
export type ChronosReadRouteResolution = ChronosRouteRedirectDecision | ChronosReadRouteContext;

const routeActionErrorMessage = 'That change could not be saved. Check the form and try again.';

export const chronosHomeRoute = '/' as const;

export const chronosHomeRedirect = {
  kind: 'redirect',
  location: chronosAppRoutes.today,
  status: 302,
} as const satisfies ChronosRouteRedirectDecision;

export const chronosAppIndexRedirect = chronosHomeRedirect;

export function resolveChronosHomeRedirect(): ChronosRouteRedirectDecision {
  return chronosHomeRedirect;
}

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
  let actionDraft: TodayActionDraft | undefined;
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
    actionDraft = actionDecision.actionDraft;
  }

  const statusMessage = await resolveRouteStatusMessage(
    currentUrl,
    actionError,
    repositories,
    authDecision.user.id,
  );
  const feedbackOrigin =
    actionDecision?.kind === 'error' && actionDecision.feedbackOrigin
      ? actionDecision.feedbackOrigin
      : readTodayFeedbackOrigin(currentUrl.searchParams.get('feedbackOrigin'));

  return {
    kind: 'ready',
    repositories,
    userId: authDecision.user.id,
    email: authDecision.email,
    actionError,
    statusMessage,
    ...(feedbackOrigin ? { feedbackOrigin } : {}),
    ...(actionDraft ? { actionDraft } : {}),
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

  const draftRequest = request.clone();
  const feedbackRequest = request.clone();

  try {
    const formData = await request.formData();
    const result = await actionHandler(repositories, userId, formData);
    const feedbackOrigin = readTodayFeedbackOrigin(formData.get('feedbackOrigin'));

    return resolveChronosRouteActionRedirect(
      currentUrl,
      routePath,
      result.status,
      result.destination,
      feedbackOrigin,
    );
  } catch (error) {
    const safeTodayError =
      routePath === chronosAppRoutes.today &&
      error instanceof Error &&
      /^(?:focus must be at most 160 characters|constraints must be at most 500 characters|outcome (?:is required|must be at most 500 characters)|tomorrowAdjustment (?:is required|must be at most 280 characters)|destination (?:is required|is invalid)|title is required)\.$/.test(
        error.message,
      );
    const feedbackOrigin = await readTodayFeedbackOriginSafely(feedbackRequest);
    return {
      kind: 'error',
      message: safeTodayError ? error.message : routeActionErrorMessage,
      ...(feedbackOrigin ? { feedbackOrigin } : {}),
      ...(routePath === chronosAppRoutes.today
        ? { actionDraft: await readTodayActionDraftSafely(draftRequest) }
        : {}),
    };
  }
}

export function resolveChronosRouteActionRedirect(
  currentUrl: URL,
  routePath: ChronosAppActionPath,
  status: ChronosAppActionStatus,
  destination?: string,
  feedbackOrigin?: TodayFeedbackOrigin,
): ChronosRouteActionDecision {
  const nextUrl = new URL(routePath, currentUrl);
  nextUrl.searchParams.set('status', status);
  if (destination) nextUrl.searchParams.set('destination', destination);
  if (feedbackOrigin) nextUrl.searchParams.set('feedbackOrigin', feedbackOrigin);

  return { kind: 'redirect', location: getPathWithSearch(nextUrl), status: 303 };
}

async function resolveRouteStatusMessage(
  currentUrl: URL,
  actionError: string | null,
  repositories: ChronosAppRepositories,
  userId: string,
): Promise<string | null> {
  const message = resolveChronosRouteStatusMessage(currentUrl, actionError);
  const destination = currentUrl.searchParams.get('destination');

  if (message !== 'Task added.' || !destination) return message;
  if (destination === 'unassigned') return 'Task added to Unassigned.';
  if (!destination.startsWith('block:')) return message;

  try {
    const block = await repositories.blocks.findById({
      userId,
      blockId: destination.slice('block:'.length),
    });
    return block ? `Task added to ${block.title}.` : message;
  } catch {
    return message;
  }
}

function readTodayFeedbackOrigin(
  value: FormDataEntryValue | null,
): TodayFeedbackOrigin | undefined {
  return value === 'today-day-sheet' ||
    value === 'today-inbox' ||
    value === 'today-quick-block' ||
    value === 'today-close-review'
    ? value
    : undefined;
}

async function readTodayFeedbackOriginSafely(
  request: Request,
): Promise<TodayFeedbackOrigin | undefined> {
  try {
    return readTodayFeedbackOrigin((await request.formData()).get('feedbackOrigin'));
  } catch {
    return undefined;
  }
}

async function readTodayActionDraftSafely(request: Request): Promise<TodayActionDraft | undefined> {
  try {
    return readTodayActionDraft(await request.formData());
  } catch {
    return undefined;
  }
}

function readTodayActionDraft(formData: FormData): TodayActionDraft | undefined {
  const action = formData.get('action');
  const value = (name: string) => {
    const field = formData.get(name);
    return typeof field === 'string' ? field.trim() : '';
  };

  if (action === 'today-save-daily-header') {
    return { action, focus: value('focus'), constraints: value('constraints') };
  }
  if (action === 'today-create-task') {
    return { action, title: value('title'), destination: value('destination') };
  }
  if (action === 'today-save-closeout') {
    return { action, outcome: value('outcome'), tomorrowAdjustment: value('tomorrowAdjustment') };
  }
  if (action === 'today-save-goals') {
    return {
      action,
      goals: formData
        .getAll('goals')
        .map((field) => (typeof field === 'string' ? field.trim() : '')),
    };
  }
  if (action === 'assign-task') {
    return { action, taskId: value('taskId'), blockId: value('blockId') };
  }
  if (action === 'create-planned-block') {
    return {
      action,
      title: value('title'),
      category: value('category'),
      date: value('date'),
      startTime: value('startTime'),
      endTime: value('endTime'),
    };
  }

  return undefined;
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
