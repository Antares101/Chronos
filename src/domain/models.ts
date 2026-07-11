export const blockCategories = ['work', 'home', 'training'] as const;
export type BlockCategory = (typeof blockCategories)[number];

export const blockPhases = ['planning', 'execution', 'conclusion'] as const;
export type BlockPhase = (typeof blockPhases)[number];

export const taskStatuses = ['todo', 'done'] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const taskSources = ['general', 'block'] as const;
export type TaskSource = (typeof taskSources)[number];

export const pauseKinds = ['5m', '10m', 'untimed'] as const;
export type PauseKind = (typeof pauseKinds)[number];

export const actualActivities = ['focus', 'pause', 'inactivity'] as const;
export type ActualActivity = (typeof actualActivities)[number];

export type Block = {
  id: string;
  userId: string;
  category: BlockCategory;
  title: string;
  plannedStart: string;
  plannedEnd: string;
  phase: BlockPhase;
  createdAt: string;
  updatedAt: string;
};

export type ChronosTask = {
  id: string;
  userId: string;
  blockId: string | null;
  title: string;
  status: TaskStatus;
  source: TaskSource;
  createdAt: string;
  updatedAt: string;
};

export type ChronosEvent = {
  id: string;
  userId: string;
  blockId: string;
  title: string;
  highlighted: true;
  occurredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Pause = {
  id: string;
  userId: string;
  blockId: string;
  kind: PauseKind;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ActualTimeEntry = {
  id: string;
  userId: string;
  blockId: string;
  phase: BlockPhase;
  startedAt: string;
  endedAt: string;
  activity: ActualActivity;
  pauseId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConclusionReview = {
  id: string;
  userId: string;
  blockId: string;
  completedTaskIds: string[];
  plannedMinutes: number;
  actualMinutes: number;
  notes: string;
  nextAdjustment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TodayGoal = {
  id: string;
  userId: string;
  goalDate: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type DailyWorkspace = {
  id: string;
  userId: string;
  workspaceDate: string;
  focus: string | null;
  constraints: string | null;
  outcome: string | null;
  tomorrowAdjustment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DailyHeaderInput = Pick<DailyWorkspace, 'focus' | 'constraints'>;
export type DailyCloseoutInput = Pick<DailyWorkspace, 'outcome' | 'tomorrowAdjustment'>;

export type NewBlock = Omit<Block, 'id' | 'createdAt' | 'updatedAt'>;
export type PlannedScheduleUpdate = Pick<Block, 'plannedStart' | 'plannedEnd'>;
export type NewTask = Omit<ChronosTask, 'id' | 'createdAt' | 'updatedAt'>;
export type NewEvent = Omit<ChronosEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type NewPause = Omit<Pause, 'id' | 'createdAt' | 'updatedAt'>;
export type NewActualTimeEntry = Omit<ActualTimeEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewConclusionReview = Omit<ConclusionReview, 'id' | 'createdAt' | 'updatedAt'>;
export type NewTodayGoal = Omit<TodayGoal, 'id' | 'createdAt' | 'updatedAt'>;
