import type { APIRoute } from 'astro';

import { resolveSignOutDecision, type ChronosAuthLocals } from '../server/auth';

export const POST: APIRoute = async ({ locals, redirect }) => {
  const authLocals = locals as ChronosAuthLocals;
  const signOutDecision = await resolveSignOutDecision(() => authLocals.supabase.auth.signOut());

  return redirect(signOutDecision.location, signOutDecision.status);
};
