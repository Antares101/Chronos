import { getChronosDatabase, type ChronosDatabase } from '../db';
import {
  DrizzleActualTimeEntryRepository,
  DrizzleBlockRepository,
  DrizzleConclusionReviewRepository,
  DrizzleEventRepository,
  DrizzlePauseRepository,
  DrizzleTaskRepository,
} from '../repositories/drizzle';
import type { ChronosAppRepositories } from './chronos-app';

export function createChronosAppRepositories(
  db: ChronosDatabase = getChronosDatabase(),
): ChronosAppRepositories {
  return {
    blocks: new DrizzleBlockRepository(db),
    tasks: new DrizzleTaskRepository(db),
    events: new DrizzleEventRepository(db),
    pauses: new DrizzlePauseRepository(db),
    actualTimeEntries: new DrizzleActualTimeEntryRepository(db),
    conclusionReviews: new DrizzleConclusionReviewRepository(db),
  };
}
