type EnvValue = string | undefined;

type ChronosEnv = {
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
  PUBLIC_AUTH_REDIRECT_ORIGIN?: string;
  DATABASE_URL?: string;
};

type RequiredPublicEnvKey = 'PUBLIC_SUPABASE_URL' | 'PUBLIC_SUPABASE_ANON_KEY';

function readEnv(key: keyof ChronosEnv): EnvValue {
  return import.meta.env[key];
}

function requireEnv(key: RequiredPublicEnvKey): string {
  const value = readEnv(key);

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env: ChronosEnv = {
  PUBLIC_SUPABASE_URL: requireEnv('PUBLIC_SUPABASE_URL'),
  PUBLIC_SUPABASE_ANON_KEY: requireEnv('PUBLIC_SUPABASE_ANON_KEY'),
  PUBLIC_AUTH_REDIRECT_ORIGIN: readEnv('PUBLIC_AUTH_REDIRECT_ORIGIN'),
  DATABASE_URL: readEnv('DATABASE_URL'),
};
