import type {
  ActualTimeEntry,
  Block,
  BlockCategory,
  ChronosEvent,
  ChronosTask,
  Pause,
  PauseKind,
} from '../../domain/models';
import { blockCategories, pauseKinds } from '../../domain/models';
import type {
  ActualTimeEntryRepository,
  BlockQuery,
  BlockRepository,
  ConclusionReviewRepository,
  EventRepository,
  PauseRepository,
  TaskRepository,
} from '../../domain/repositories';
import { orderBlocksForChronogram } from '../../domain/services/chronogram';
import {
  assertReviewMatchesBlock,
  concludeBlock,
  startBlock,
} from '../../domain/services/lifecycle';
import { calculatePlannedVsActual } from '../../domain/services/metrics';
import { buildPauseActualEntry, logPause } from '../../domain/services/pauses';
import {
  createPlannedBlock,
  updatePlannedBlockSchedule,
} from '../../domain/services/weekly-planning';
import type { BlockDetailProps } from '../../components/block/BlockDetail';
import type { WeeklyCalendarProps } from '../../components/calendar/WeeklyCalendar';
import type { WeeklyInsightProps } from '../../components/metrics/WeeklyInsight';
import type { ConclusionPanelProps } from '../../components/review/ConclusionPanel';
import type { TaskListProps } from '../../components/tasks/TaskList';
import type { DailyTimelineProps } from '../../components/timeline/DailyTimeline';

export type ChronosAppRepositories = {
  blocks: BlockRepository;
  tasks: TaskRepository;
  events: EventRepository;
  pauses: PauseRepository;
  actualTimeEntries: ActualTimeEntryRepository;
  conclusionReviews: ConclusionReviewRepository;
};

export type ChronosAppState = {
  blocks: Block[];
  planningBlocks: Block[];
  executionBlocks: Block[];
  assignableTasks: ChronosTask[];
  tasksByBlockId: Record<string, ChronosTask[]>;
  defaultPlanningDate: string;
  dailyTimeline: DailyTimelineProps;
  weeklyCalendar: WeeklyCalendarProps;
  taskList: TaskListProps;
  blockDetail: BlockDetailProps | null;
  conclusionPanel: ConclusionPanelProps | null;
  weeklyInsight: WeeklyInsightProps;
};

export type ChronosAppActionStatus =
  | 'created'
  | 'rescheduled'
  | 'task-created'
  | 'assigned'
  | 'started'
  | 'pause-logged'
  | 'pause-ended'
  | 'event-created'
  | 'concluded';

export type ChronosAppActionResult = {
  status: ChronosAppActionStatus;
};

type Clock = () => string;

const statusMessages: Record<ChronosAppActionStatus, string> = {
  created: 'Planned block created.',
  rescheduled: 'Planned block schedule updated.',
  'task-created': 'Block task created.',
  assigned: 'Task moved into the selected block.',
  started: 'Block started.',
  'pause-logged': 'Pause logged.',
  'pause-ended': 'Untimed pause ended.',
  'event-created': 'Highlighted event created.',
  concluded: 'Block conclusion saved.',
};

const categoryLabels: Record<BlockCategory, string> = {
  work: 'Work',
  home: 'Home',
  training: 'Training',
};

export async function loadChronosAppState(
  repositories: ChronosAppRepositories,
  userId: string,
  now: Clock = () => new Date().toISOString(),
): Promise<ChronosAppState> {
  const nowIso = now();
  const [allBlocks, allTasks, allActualEntries] = await Promise.all([
    repositories.blocks.listForUser(userId),
    repositories.tasks.listForUser(userId),
    repositories.actualTimeEntries.listForUser(userId),
  ]);

  const blocks = orderBlocksForChronogram(allBlocks.filter((block) => block.userId === userId));
  const tasks = allTasks.filter((task) => task.userId === userId);
  const actualEntries = allActualEntries.filter((entry) => entry.userId === userId);
  const [eventsByBlockId, pausesByBlockId] = await loadBlockChildren(repositories, userId, blocks);
  const selectedBlock = selectPrimaryBlock(blocks);
  const selectedReview = selectedBlock
    ? await repositories.conclusionReviews.findForBlock({ userId, blockId: selectedBlock.id })
    : null;
  const dailyDate = selectDailyDate(nowIso);
  const defaultPlanningDate = dailyDate;
  const tasksByBlockId = groupTasksByBlockId(tasks);

  return {
    blocks,
    planningBlocks: blocks.filter((block) => block.phase === 'planning'),
    executionBlocks: blocks.filter((block) => block.phase === 'execution'),
    assignableTasks: tasks.filter((task) => task.blockId === null),
    tasksByBlockId,
    defaultPlanningDate,
    dailyTimeline: buildDailyTimelineProps(blocks, pausesByBlockId, dailyDate, nowIso),
    weeklyCalendar: buildWeeklyCalendarProps(blocks, eventsByBlockId, defaultPlanningDate),
    taskList: buildTaskListProps(tasks),
    blockDetail: selectedBlock
      ? buildBlockDetailProps(
          selectedBlock,
          tasksByBlockId[selectedBlock.id] ?? [],
          eventsByBlockId.get(selectedBlock.id) ?? [],
          pausesByBlockId.get(selectedBlock.id) ?? [],
        )
      : null,
    conclusionPanel:
      selectedBlock && selectedReview
        ? buildConclusionPanelProps(
            selectedBlock,
            selectedReview,
            tasksByBlockId[selectedBlock.id] ?? [],
          )
        : null,
    weeklyInsight: {
      eyebrow: 'Weekly summary',
      title: 'Planned vs actual',
      description: 'Stored block and actual-time data summarized by category, block, and phase.',
      summary: calculatePlannedVsActual(blocks, actualEntries),
    },
  };
}

export async function handleChronosAppAction(
  repositories: ChronosAppRepositories,
  userId: string,
  formData: FormData,
  now: Clock = () => new Date().toISOString(),
): Promise<ChronosAppActionResult> {
  const action = requireFormString(formData, 'action');

  switch (action) {
    case 'create-planned-block': {
      const schedule = readScheduleFromForm(formData);
      await createPlannedBlock(repositories.blocks, {
        userId,
        title: requireFormString(formData, 'title'),
        category: readCategory(formData),
        ...schedule,
      });

      return { status: 'created' };
    }
    case 'update-planned-schedule': {
      const schedule = readScheduleFromForm(formData);
      await updatePlannedBlockSchedule(repositories.blocks, {
        userId,
        blockId: requireFormString(formData, 'blockId'),
        ...schedule,
      });

      return { status: 'rescheduled' };
    }
    case 'assign-task': {
      await repositories.tasks.assignToBlock({
        userId,
        taskId: requireFormString(formData, 'taskId'),
        blockId: requireFormString(formData, 'blockId'),
      });

      return { status: 'assigned' };
    }
    case 'create-task': {
      const block = await findRequiredBlock(repositories.blocks, {
        userId,
        blockId: requireFormString(formData, 'blockId'),
      });

      await repositories.tasks.create({
        userId,
        blockId: block.id,
        title: requireFormString(formData, 'title'),
        status: 'todo',
        source: 'block',
      });

      return { status: 'task-created' };
    }
    case 'start-block': {
      const block = await findRequiredBlock(repositories.blocks, {
        userId,
        blockId: requireFormString(formData, 'blockId'),
      });

      await assertNoOtherExecutionBlock(repositories.blocks, userId, block.id);

      const result = startBlock(block, now);

      await repositories.blocks.updatePhase({ userId, blockId: block.id }, result.phase);
      await repositories.actualTimeEntries.create(result.actualEntry);

      return { status: 'started' };
    }
    case 'log-pause': {
      const block = await findRequiredBlock(repositories.blocks, {
        userId,
        blockId: requireFormString(formData, 'blockId'),
      });
      const result = logPause({
        block,
        kind: readPauseKind(formData),
        note: readOptionalFormString(formData, 'note'),
        now,
      });
      const pause = await repositories.pauses.create(result.pause);

      if (pause.endedAt) {
        await repositories.actualTimeEntries.create(buildPauseActualEntry(pause));
      }

      return { status: 'pause-logged' };
    }
    case 'end-pause': {
      const block = await findRequiredBlock(repositories.blocks, {
        userId,
        blockId: requireFormString(formData, 'blockId'),
      });
      const pause = await findRequiredPause(repositories.pauses, {
        userId,
        blockId: block.id,
        pauseId: requireFormString(formData, 'pauseId'),
      });
      const endedAt = now();

      assertCanEndUntimedPause(block, pause, endedAt);

      const endedPause = await repositories.pauses.end({
        userId,
        blockId: block.id,
        pauseId: pause.id,
        endedAt,
      });

      await repositories.actualTimeEntries.create(buildPauseActualEntry(endedPause));

      return { status: 'pause-ended' };
    }
    case 'create-highlighted-event': {
      const block = await findRequiredBlock(repositories.blocks, {
        userId,
        blockId: requireFormString(formData, 'blockId'),
      });

      await repositories.events.create({
        userId,
        blockId: block.id,
        title: requireFormString(formData, 'title'),
        highlighted: true,
        occurredAt: now(),
      });

      return { status: 'event-created' };
    }
    case 'conclude-block': {
      const block = await findRequiredBlock(repositories.blocks, {
        userId,
        blockId: requireFormString(formData, 'blockId'),
      });
      const blockQuery = { userId, blockId: block.id };
      const pauses = await repositories.pauses.listForBlock(blockQuery);
      const completedTaskIds = readStringList(formData, 'completedTaskIds');
      const notes = requireFormString(formData, 'notes');
      const nextAdjustment = readOptionalFormString(formData, 'nextAdjustment');

      assertNoOpenPauses(pauses);

      const actualEntries = await repositories.actualTimeEntries.listForBlock(blockQuery);
      const closedActualEntries = await closeActiveFocusEntry(
        repositories,
        blockQuery,
        actualEntries,
        now(),
      );
      const result = concludeBlock({
        block,
        actualEntries: closedActualEntries,
        completedTaskIds,
        notes,
        nextAdjustment,
      });
      const review = await repositories.conclusionReviews.create(result.review);

      assertReviewMatchesBlock(review, block);
      await repositories.blocks.updatePhase({ userId, blockId: block.id }, result.phase);

      return { status: 'concluded' };
    }
    default:
      throw new Error('Unsupported Chronos app action.');
  }
}

export function getChronosAppStatusMessage(value: string | null): string | null {
  if (isChronosAppActionStatus(value)) {
    return statusMessages[value];
  }

  return null;
}

export function getDateInputValue(iso: string): string {
  return getDateKey(iso);
}

export function getTimeInputValue(iso: string): string {
  return iso.slice(11, 16);
}

function buildDailyTimelineProps(
  blocks: Block[],
  pausesByBlockId: Map<string, Pause[]>,
  date: string,
  nowIso: string,
): DailyTimelineProps {
  const dailyBlocks = blocks.filter((block) => getDateKey(block.plannedStart) === date);
  const dailyPauses = dailyBlocks.flatMap((block) => pausesByBlockId.get(block.id) ?? []);
  const currentTime = getDateKey(nowIso) === date ? nowIso : null;

  return {
    eyebrow: `Today · ${date}`,
    title: 'Your persisted day',
    description: 'Stored blocks and pauses are loaded from the authenticated backend session.',
    visibleStart: `${date}T00:00:00.000Z`,
    visibleEnd: `${date}T23:59:59.999Z`,
    currentTime,
    blocks: dailyBlocks.map((block) => ({
      id: block.id,
      title: block.title,
      category: block.category,
      phase: block.phase,
      plannedStart: block.plannedStart,
      plannedEnd: block.plannedEnd,
    })),
    pauses: dailyPauses.map((pause) => ({
      id: pause.id,
      blockId: pause.blockId,
      kind: pause.kind,
      startedAt: pause.startedAt,
      endedAt: pause.endedAt,
      note: pause.note ?? undefined,
    })),
  };
}

function buildWeeklyCalendarProps(
  blocks: Block[],
  eventsByBlockId: Map<string, ChronosEvent[]>,
  anchorDate: string,
): WeeklyCalendarProps {
  const weekStart = getWeekStart(anchorDate);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addUtcDays(weekStart, index);

    return {
      date,
      label: getWeekdayLabel(date),
      blocks: blocks
        .filter((block) => getDateKey(block.plannedStart) === date)
        .map((block) => ({
          id: block.id,
          title: block.title,
          category: block.category,
          plannedStart: block.plannedStart,
          plannedEnd: block.plannedEnd,
          highlightedEvents: (eventsByBlockId.get(block.id) ?? []).map((event) => ({
            id: event.id,
            title: event.title,
          })),
        })),
    };
  });

  return {
    eyebrow: 'Weekly planning',
    title: 'Stored weekly plan',
    description: 'Create and reschedule persisted blocks before they enter execution.',
    visibleStart: `${weekStart}T00:00:00.000Z`,
    visibleEnd: `${weekStart}T23:59:59.999Z`,
    days,
  };
}

function buildTaskListProps(tasks: ChronosTask[]): TaskListProps {
  return {
    eyebrow: 'Backlog',
    title: 'General task list',
    description: 'Unassigned tasks can be moved into persisted blocks.',
    tasks: tasks
      .filter((task) => task.blockId === null)
      .map((task) => ({ id: task.id, title: task.title, status: task.status })),
  };
}

function buildBlockDetailProps(
  block: Block,
  tasks: ChronosTask[],
  events: ChronosEvent[],
  pauses: Pause[],
): BlockDetailProps {
  return {
    eyebrow: 'Selected block',
    title: 'Block context and controls',
    description:
      'Block tasks, highlighted events, and pause controls are loaded from persisted data.',
    block: {
      id: block.id,
      title: block.title,
      category: block.category,
      phase: block.phase,
      plannedStart: block.plannedStart,
      plannedEnd: block.plannedEnd,
    },
    tasks: tasks.map((task) => ({ id: task.id, title: task.title, status: task.status })),
    highlightedEvents: events.map((event) => ({
      id: event.id,
      title: event.title,
      note: event.occurredAt ? `Occurred at ${event.occurredAt}` : undefined,
    })),
    pauses: pauses.map((pause) => ({
      id: pause.id,
      kind: pause.kind,
      startedAt: pause.startedAt,
      endedAt: pause.endedAt,
      note: pause.note ?? undefined,
    })),
  };
}

function buildConclusionPanelProps(
  block: Block,
  review: NonNullable<Awaited<ReturnType<ConclusionReviewRepository['findForBlock']>>>,
  tasks: ChronosTask[],
): ConclusionPanelProps {
  assertReviewMatchesBlock(review, block);

  const completedTaskIds = new Set(review.completedTaskIds);

  return {
    eyebrow: 'Conclusion view',
    title: 'Block conclusion',
    description: 'Stored conclusion review for the selected block.',
    block: {
      id: block.id,
      title: block.title,
      category: block.category,
    },
    completedTaskIds: review.completedTaskIds,
    completedTasks: tasks
      .filter((task) => completedTaskIds.has(task.id))
      .map((task) => ({ id: task.id, title: task.title })),
    plannedMinutes: review.plannedMinutes,
    actualMinutes: review.actualMinutes,
    notes: review.notes,
    nextAdjustment: review.nextAdjustment,
  };
}

async function loadBlockChildren(
  repositories: ChronosAppRepositories,
  userId: string,
  blocks: Block[],
): Promise<[Map<string, ChronosEvent[]>, Map<string, Pause[]>]> {
  const entries = await Promise.all(
    blocks.map(async (block) => {
      const query = { userId, blockId: block.id };
      const [events, pauses] = await Promise.all([
        repositories.events.listForBlock(query),
        repositories.pauses.listForBlock(query),
      ]);

      return [block.id, events, pauses] as const;
    }),
  );

  return [
    new Map(entries.map(([blockId, events]) => [blockId, events])),
    new Map(entries.map(([blockId, , pauses]) => [blockId, pauses])),
  ];
}

function selectPrimaryBlock(blocks: Block[]): Block | null {
  return (
    blocks.find((block) => block.phase === 'execution') ??
    blocks.find((block) => block.phase === 'planning') ??
    blocks.find((block) => block.phase === 'conclusion') ??
    null
  );
}

function selectDailyDate(nowIso: string): string {
  return getDateKey(nowIso);
}

function groupTasksByBlockId(tasks: ChronosTask[]): Record<string, ChronosTask[]> {
  return tasks.reduce<Record<string, ChronosTask[]>>((groupedTasks, task) => {
    if (task.blockId) {
      groupedTasks[task.blockId] ??= [];
      groupedTasks[task.blockId].push(task);
    }

    return groupedTasks;
  }, {});
}

async function closeActiveFocusEntry(
  repositories: ChronosAppRepositories,
  query: BlockQuery,
  actualEntries: ActualTimeEntry[],
  endedAt: string,
): Promise<ActualTimeEntry[]> {
  const activeFocusEntry = findActiveFocusEntry(actualEntries, query);

  if (!activeFocusEntry) {
    return actualEntries;
  }

  assertEndTimeNotBeforeStart(
    activeFocusEntry.startedAt,
    endedAt,
    'Focus actual entry end time must not be before its start time.',
  );

  const endedFocusEntry = await repositories.actualTimeEntries.end({
    ...query,
    actualEntryId: activeFocusEntry.id,
    endedAt,
  });

  return actualEntries.map((entry) => (entry.id === endedFocusEntry.id ? endedFocusEntry : entry));
}

async function assertNoOtherExecutionBlock(
  repository: BlockRepository,
  userId: string,
  startingBlockId: string,
): Promise<void> {
  const activeBlock = (await repository.listForUser(userId)).find(
    (block) => block.phase === 'execution' && block.id !== startingBlockId,
  );

  if (activeBlock) {
    throw new Error('Only one block can be in execution at a time.');
  }
}

function findActiveFocusEntry(
  actualEntries: ActualTimeEntry[],
  query: BlockQuery,
): ActualTimeEntry | null {
  const focusEntries = actualEntries
    .filter(
      (entry) =>
        entry.userId === query.userId &&
        entry.blockId === query.blockId &&
        entry.phase === 'execution' &&
        entry.activity === 'focus' &&
        entry.pauseId === null,
    )
    .sort((first, second) => first.startedAt.localeCompare(second.startedAt));

  return focusEntries[focusEntries.length - 1] ?? null;
}

async function findRequiredBlock(repository: BlockRepository, query: BlockQuery): Promise<Block> {
  const block = await repository.findById(query);

  if (!block) {
    throw new Error('Block was not found in the current user scope.');
  }

  return block;
}

async function findRequiredPause(
  repository: PauseRepository,
  query: BlockQuery & { pauseId: string },
): Promise<Pause> {
  const pauses = await repository.listForBlock(query);
  const pause = pauses.find((candidate) => candidate.id === query.pauseId);

  if (!pause) {
    throw new Error('Pause was not found in the current user scope.');
  }

  return pause;
}

function assertCanEndUntimedPause(block: Block, pause: Pause, endedAt: string): void {
  if (block.phase !== 'execution') {
    throw new Error('Untimed pauses can only be ended inside an execution block.');
  }

  if (pause.userId !== block.userId || pause.blockId !== block.id) {
    throw new Error('Pause must belong to the same user and block.');
  }

  if (pause.kind !== 'untimed') {
    throw new Error('Only untimed pauses can be ended manually.');
  }

  if (pause.endedAt) {
    throw new Error('Pause has already ended.');
  }

  assertEndTimeNotBeforeStart(
    pause.startedAt,
    endedAt,
    'Pause end time must not be before its start time.',
  );
}

function assertNoOpenPauses(pauses: Pause[]): void {
  if (pauses.some((pause) => pause.endedAt === null)) {
    throw new Error('End open pauses before concluding the block.');
  }
}

function assertEndTimeNotBeforeStart(startedAt: string, endedAt: string, message: string): void {
  const startMs = Date.parse(startedAt);
  const endMs = Date.parse(endedAt);

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error('Time values must be valid ISO date strings.');
  }

  if (endMs < startMs) {
    throw new Error(message);
  }
}

function readScheduleFromForm(formData: FormData): { plannedStart: string; plannedEnd: string } {
  const date = requireFormString(formData, 'date');
  const startTime = requireFormString(formData, 'startTime');
  const endTime = requireFormString(formData, 'endTime');

  return {
    plannedStart: combineDateAndTime(date, startTime),
    plannedEnd: combineDateAndTime(date, endTime),
  };
}

function readCategory(formData: FormData): BlockCategory {
  const category = requireFormString(formData, 'category');

  if (!blockCategories.includes(category as BlockCategory)) {
    throw new Error('Block category is invalid.');
  }

  return category as BlockCategory;
}

function readPauseKind(formData: FormData): PauseKind {
  const kind = requireFormString(formData, 'pauseKind');

  if (!pauseKinds.includes(kind as PauseKind)) {
    throw new Error('Pause kind is invalid.');
  }

  return kind as PauseKind;
}

function requireFormString(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

function readOptionalFormString(formData: FormData, fieldName: string): string | null {
  const value = formData.get(fieldName);

  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  return value.trim();
}

function readStringList(formData: FormData, fieldName: string): string[] {
  return formData
    .getAll(fieldName)
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);
}

function combineDateAndTime(date: string, time: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Schedule date must use YYYY-MM-DD format.');
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('Schedule time must use HH:mm format.');
  }

  return `${date}T${time}:00.000Z`;
}

function isChronosAppActionStatus(value: string | null): value is ChronosAppActionStatus {
  return value !== null && value in statusMessages;
}

function getDateKey(iso: string): string {
  return new Date(Date.parse(iso)).toISOString().slice(0, 10);
}

function getWeekStart(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  const day = parsedDate.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  return addUtcDays(getDateKey(parsedDate.toISOString()), mondayOffset);
}

function addUtcDays(date: string, days: number): string {
  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  parsedDate.setUTCDate(parsedDate.getUTCDate() + days);

  return getDateKey(parsedDate.toISOString());
}

function getWeekdayLabel(date: string): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00.000Z`),
  );
}

export { categoryLabels };
