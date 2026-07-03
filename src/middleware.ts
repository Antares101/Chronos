import { defineMiddleware } from 'astro:middleware';

import {
  createChronosServerClient,
  createMockLocalAuthLocals,
  resolveAuthMiddlewareDecision,
  type ChronosAuthLocals,
} from './server/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const locals = context.locals as typeof context.locals & ChronosAuthLocals;
  const mockLocalAuthLocals = createMockLocalAuthLocals(
    context.url,
    import.meta.env.DEV,
    getSafeClientAddress(context),
  );

  if (mockLocalAuthLocals) {
    locals.supabase = mockLocalAuthLocals.supabase;
    locals.session = mockLocalAuthLocals.session;
    locals.user = mockLocalAuthLocals.user;

    return next();
  }

  const supabase = createChronosServerClient(context.request, context.cookies);

  locals.supabase = supabase;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  locals.session = session;
  locals.user = error ? null : user;

  const authDecision = resolveAuthMiddlewareDecision(context.url, locals.user);

  if (authDecision.kind === 'redirect') {
    return context.redirect(authDecision.location, authDecision.status);
  }

  return next();
});

function getSafeClientAddress(context: { clientAddress?: string }): string | undefined {
  try {
    return context.clientAddress;
  } catch {
    return undefined;
  }
}
