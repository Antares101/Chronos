import type { APIRoute } from 'astro';

import { resolveAuthCallbackDecision, type ChronosAuthLocals } from '../../server/auth';

export const GET: APIRoute = async ({ locals, redirect, url }) => {
  const authLocals = locals as ChronosAuthLocals;
  const authDecision = await resolveAuthCallbackDecision(url, (code) =>
    authLocals.supabase.auth.exchangeCodeForSession(code),
  );

  return redirect(authDecision.location, authDecision.status);
};
