import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Phase 2 task 2.2 will introduce this schema file before Drizzle commands are used.
  // Keep the foundation config in place without creating schema/migrations in Slice 1.
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
});
