import type {
  ActualTimeEntry,
  Block,
  BlockPhase,
  ChronosEvent,
  ChronosTask,
  ConclusionReview,
  NewActualTimeEntry,
  NewBlock,
  NewConclusionReview,
  NewEvent,
  NewPause,
  NewTask,
  Pause,
} from './models';

export type UserScopedQuery = {
  userId: string;
};

export type BlockQuery = UserScopedQuery & {
  blockId: string;
};

export interface BlockRepository {
  create(input: NewBlock): Promise<Block>;
  listForUser(userId: string): Promise<Block[]>;
  findById(query: BlockQuery): Promise<Block | null>;
  updatePhase(query: BlockQuery, phase: BlockPhase): Promise<Block>;
}

export interface TaskRepository {
  create(input: NewTask): Promise<ChronosTask>;
  listForUser(userId: string): Promise<ChronosTask[]>;
  listForBlock(query: BlockQuery): Promise<ChronosTask[]>;
  assignToBlock(query: BlockQuery & { taskId: string }): Promise<ChronosTask>;
}

export interface EventRepository {
  create(input: NewEvent): Promise<ChronosEvent>;
  listForBlock(query: BlockQuery): Promise<ChronosEvent[]>;
}

export interface PauseRepository {
  create(input: NewPause): Promise<Pause>;
  end(query: BlockQuery & { pauseId: string; endedAt: string }): Promise<Pause>;
  listForBlock(query: BlockQuery): Promise<Pause[]>;
}

export interface ActualTimeEntryRepository {
  create(input: NewActualTimeEntry): Promise<ActualTimeEntry>;
  listForUser(userId: string): Promise<ActualTimeEntry[]>;
  listForBlock(query: BlockQuery): Promise<ActualTimeEntry[]>;
}

export interface ConclusionReviewRepository {
  create(input: NewConclusionReview): Promise<ConclusionReview>;
  findForBlock(query: BlockQuery): Promise<ConclusionReview | null>;
}
