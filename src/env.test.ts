import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('env validation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns configured foundation environment values', async () => {
    vi.stubEnv('PUBLIC_SUPABASE_URL', 'http://localhost:54321');
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'local-anon-key');
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:54322/postgres');

    const { env } = await import('./env');

    expect(env).toEqual({
      PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      PUBLIC_SUPABASE_ANON_KEY: 'local-anon-key',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
    });
  });

  it('throws when a required public environment variable is missing', async () => {
    vi.stubEnv('PUBLIC_SUPABASE_URL', undefined);
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'local-anon-key');

    await expect(import('./env')).rejects.toThrow(
      'Missing required environment variable: PUBLIC_SUPABASE_URL',
    );
  });
});
