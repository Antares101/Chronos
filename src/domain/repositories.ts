import type {
  ActualTimeEntry,
  Block,
  BlockPhase,
  ChronosEvent,
  ChronosTask,
  ConclusionReview,
  DailyCloseoutInput,
  DailyHeaderInput,
  DailyWorkspace,
  NewActualTimeEntry,
  NewBlock,
  NewConclusionReview,
  NewEvent,
  NewPause,
  NewTask,
  NewTodayGoal,
  Pause,
  PlannedScheduleUpdate,
  TaskStatus,
  TodayGoal,
} from './models';

export type UserScopedQuery = {
  userId: string;
};

export type BlockQuery = UserScopedQuery & {
  blockId: string;
};

export type TodayGoalQuery = UserScopedQuery & {
  goalDate: string;
};

export type DailyWorkspaceQuery = UserScopedQuery & {
  workspaceDate: string;
};

export interface BlockRepository {
  create(input: NewBlock): Promise<Block>;
  listForUser(userId: string): Promise<Block[]>;
  findById(query: BlockQuery): Promise<Block | null>;
  updatePhase(query: BlockQuery, phase: BlockPhase): Promise<Block>;
  updatePlannedSchedule(query: BlockQuery, schedule: PlannedScheduleUpdate): Promise<Block>;
}

export interface TaskRepository {
  create(input: NewTask): Promise<ChronosTask>;
  listForUser(userId: string): Promise<ChronosTask[]>;
  listForBlock(query: BlockQuery): Promise<ChronosTask[]>;
  assignToBlock(query: BlockQuery & { taskId: string }): Promise<ChronosTask>;
  updateStatus(
    query: UserScopedQuery & { taskId: string; status: TaskStatus },
  ): Promise<ChronosTask>;
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
  end(query: BlockQuery & { actualEntryId: string; endedAt: string }): Promise<ActualTimeEntry>;
  listForUser(userId: string): Promise<ActualTimeEntry[]>;
  listForBlock(query: BlockQuery): Promise<ActualTimeEntry[]>;
}

export interface ConclusionReviewRepository {
  create(input: NewConclusionReview): Promise<ConclusionReview>;
  findForBlock(query: BlockQuery): Promise<ConclusionReview | null>;
}

export interface TodayGoalRepository {
  listForDay(query: TodayGoalQuery): Promise<TodayGoal[]>;
  replaceForDay(query: TodayGoalQuery, goals: readonly string[]): Promise<TodayGoal[]>;
  create?(input: NewTodayGoal): Promise<TodayGoal>;
}

export interface DailyWorkspaceRepository {
  findForDay(query: DailyWorkspaceQuery): Promise<DailyWorkspace | null>;
  saveHeader(query: DailyWorkspaceQuery, input: DailyHeaderInput): Promise<DailyWorkspace>;
  saveCloseout(query: DailyWorkspaceQuery, input: DailyCloseoutInput): Promise<DailyWorkspace>;
}
