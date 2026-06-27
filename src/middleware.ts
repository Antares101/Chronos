import { defineMiddleware } from 'astro:middleware';

import {
  createChronosServerClient,
  resolveAuthMiddlewareDecision,
  type ChronosAuthLocals,
} from './server/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createChronosServerClient(context.request, context.cookies);
  const locals = context.locals as typeof context.locals & ChronosAuthLocals;

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
