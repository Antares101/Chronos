import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import type * as schema from '../db/schema';
import * as chronosSchema from '../db/schema';

export type ChronosDatabase = PostgresJsDatabase<typeof schema>;

let sqlClient: ReturnType<typeof postgres> | null = null;
let chronosDatabase: ChronosDatabase | null = null;

export function getChronosDatabase(databaseUrl = import.meta.env.DATABASE_URL): ChronosDatabase {
  if (!databaseUrl) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }

  sqlClient ??= postgres(databaseUrl, { prepare: false });
  chronosDatabase ??= drizzle(sqlClient, { schema: chronosSchema });

  return chronosDatabase;
}
