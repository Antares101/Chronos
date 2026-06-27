import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import type * as schema from '../db/schema';

export type ChronosDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;
