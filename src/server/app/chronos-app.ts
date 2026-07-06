import type {
  ActualTimeEntry,
  Block,
  BlockCategory,
  ChronosEvent,
  ChronosTask,
  Pause,
  PauseKind,
  TaskStatus,
  TodayGoal,
} from '../../domain/models';
import { blockCategories, pauseKinds, taskStatuses } from '../../domain/models';
import type {
  ActualTimeEntryRepository,
  BlockQuery,
  BlockRepository,
  ConclusionReviewRepository,
  EventRepository,
  PauseRepository,
  TaskRepository,
  TodayGoalRepository,
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
import type { TodayOperatingSummaryProps } from '../../components/today/TodayOperatingSummary';
import type {
  TodayTaskPanelProps,
  TodayTaskPanelTask,
} from '../../components/today/TodayTaskPanel';

export type ChronosAppRepositories = {
  blocks: BlockRepository;
  tasks: TaskRepository;
  events: EventRepository;
  pauses: PauseRepository;
  actualTimeEntries: ActualTimeEntryRepository;
  conclusionReviews: ConclusionReviewRepository;
  todayGoals: TodayGoalRepository;
};

export type ChronosAppState = {
  blocks: Block[];
  planningBlocks: Block[];
  executionBlocks: Block[];
  assignableTasks: ChronosTask[];
  tasksByBlockId: Record<string, ChronosTask[]>;
  todayDate: string;
  dailyTimeline: DailyTimelineProps;
  weeklyCalendar: WeeklyCalendarProps;
  taskList: TaskListProps;
  blockDetail: BlockDetailProps | null;
  conclusionPanel: ConclusionPanelProps | null;
  weeklyInsight: WeeklyInsightProps;
};

export type TodayQuickBlockDefaults = {
  date: string;
  startTime: string;
  endTime: string;
};

export type ChronosTodayState = Pick<
  ChronosAppState,
  | 'blocks'
  | 'planningBlocks'
  | 'executionBlocks'
  | 'assignableTasks'
  | 'tasksByBlockId'
  | 'todayDate'
  | 'dailyTimeline'
  | 'blockDetail'
> & {
  todayOperatingSummary: TodayOperatingSummaryProps;
  todayGoals: TodayGoal[];
  todayTaskPanel: TodayTaskPanelProps;
  quickBlockDefaults: TodayQuickBlockDefaults;
};

export type ChronosPlanningState = Pick<
  ChronosAppState,
  'blocks' | 'planningBlocks' | 'assignableTasks' | 'todayDate' | 'weeklyCalendar' | 'taskList'
>;

export type ChronosReviewState = Pick<
  ChronosAppState,
  'executionBlocks' | 'tasksByBlockId' | 'conclusionPanel'
>;

export type ChronosInsightsState = Pick<ChronosAppState, 'weeklyInsight'>;

type ChronosBaseState = Pick<
  ChronosAppState,
  | 'blocks'
  | 'planningBlocks'
  | 'executionBlocks'
  | 'assignableTasks'
  | 'tasksByBlockId'
  | 'todayDate'
> & {
  tasks: ChronosTask[];
  nowIso: string;
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
  | 'concluded'
  | 'goals-saved'
  | 'task-updated';

export type ChronosAppActionResult = {
  status: ChronosAppActionStatus;
};

type Clock = () => string;

const statusMessages: Record<ChronosAppActionStatus, string> = {
  created: 'Block added.',
  rescheduled: 'Schedule updated.',
  'task-created': 'Task added.',
  assigned: 'Task moved.',
  started: 'Block started.',
  'pause-logged': 'Pause logged.',
  'pause-ended': 'Pause ended.',
  'event-created': 'Event added.',
  concluded: 'Review saved.',
  'goals-saved': 'Goals saved.',
  'task-updated': 'Task updated.',
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
  const baseState = await loadChronosBaseState(repositories, userId, now);
  const { blocks, tasks, tasksByBlockId, todayDate, nowIso } = baseState;
  const actualEntries = (await repositories.actualTimeEntries.listForUser(userId)).filter(
    (entry) => entry.userId === userId,
  );
  const [eventsByBlockId, pausesByBlockId] = await loadBlockChildren(repositories, userId, blocks);
  const selectedBlock = selectPrimaryBlock(blocks);
  const selectedReview = selectedBlock
    ? await repositories.conclusionReviews.findForBlock({ userId, blockId: selectedBlock.id })
    : null;

  return {
    blocks,
    planningBlocks: baseState.planningBlocks,
    executionBlocks: baseState.executionBlocks,
    assignableTasks: baseState.assignableTasks,
    tasksByBlockId,
    todayDate,
    dailyTimeline: buildDailyTimelineProps(blocks, pausesByBlockId, todayDate, nowIso),
    weeklyCalendar: buildWeeklyCalendarProps(blocks, eventsByBlockId, todayDate),
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
    weeklyInsight: buildWeeklyInsightProps(blocks, actualEntries),
  };
}

export async function loadChronosTodayState(
  repositories: ChronosAppRepositories,
  userId: string,
  now: Clock = () => new Date().toISOString(),
): Promise<ChronosTodayState> {
  const baseState = await loadChronosBaseState(repositories, userId, now);
  const { blocks, tasks, tasksByBlockId, todayDate, nowIso } = baseState;
  const dailyBlocks = blocks.filter((block) => getDateKey(block.plannedStart) === todayDate);
  const carryOverBlocks = blocks.filter(
    (block) => block.phase === 'execution' && getDateKey(block.plannedStart) < todayDate,
  );
  const todaySelection = selectTodayBlocks(dailyBlocks, carryOverBlocks, nowIso);
  const { selectedBlock } = todaySelection;
  const todayBlocks = uniqueBlocks([
    ...dailyBlocks,
    ...(todaySelection.currentBlock &&
    !dailyBlocks.some((block) => block.id === todaySelection.currentBlock?.id)
      ? [todaySelection.currentBlock]
      : []),
  ]);
  const childBlocks = uniqueBlocks([...dailyBlocks, ...(selectedBlock ? [selectedBlock] : [])]);
  const [eventsByBlockId, pausesByBlockId] = await loadBlockChildren(
    repositories,
    userId,
    childBlocks,
  );
  const todayGoals = await repositories.todayGoals.listForDay({ userId, goalDate: todayDate });

  return {
    blocks: todayBlocks,
    planningBlocks: todayBlocks.filter((block) => block.phase === 'planning'),
    executionBlocks: todayBlocks.filter((block) => block.phase === 'execution'),
    assignableTasks: baseState.assignableTasks,
    tasksByBlockId,
    todayDate,
    dailyTimeline: buildDailyTimelineProps(blocks, pausesByBlockId, todayDate, nowIso),
    blockDetail: selectedBlock
      ? buildBlockDetailProps(
          selectedBlock,
          tasksByBlockId[selectedBlock.id] ?? [],
          eventsByBlockId.get(selectedBlock.id) ?? [],
          pausesByBlockId.get(selectedBlock.id) ?? [],
        )
      : null,
    todayOperatingSummary: buildTodayOperatingSummary(todayDate, nowIso, todaySelection),
    todayGoals,
    todayTaskPanel: buildTodayTaskPanel(tasks, todayBlocks, todaySelection.currentBlock),
    quickBlockDefaults: getQuickBlockDefaults(nowIso),
  };
}

export async function loadChronosPlanningState(
  repositories: ChronosAppRepositories,
  userId: string,
  now: Clock = () => new Date().toISOString(),
): Promise<ChronosPlanningState> {
  const baseState = await loadChronosBaseState(repositories, userId, now);
  const eventsByBlockId = await loadBlockEvents(repositories, userId, baseState.blocks);

  return {
    blocks: baseState.blocks,
    planningBlocks: baseState.planningBlocks,
    assignableTasks: baseState.assignableTasks,
    todayDate: baseState.todayDate,
    weeklyCalendar: buildWeeklyCalendarProps(
      baseState.blocks,
      eventsByBlockId,
      baseState.todayDate,
    ),
    taskList: buildTaskListProps(baseState.tasks),
  };
}

export async function loadChronosReviewState(
  repositories: ChronosAppRepositories,
  userId: string,
  now: Clock = () => new Date().toISOString(),
): Promise<ChronosReviewState> {
  const baseState = await loadChronosBaseState(repositories, userId, now);
  const reviewedBlock = await selectReviewedBlock(repositories, userId, baseState.blocks);
  const review = reviewedBlock
    ? await repositories.conclusionReviews.findForBlock({ userId, blockId: reviewedBlock.id })
    : null;

  return {
    executionBlocks: baseState.executionBlocks,
    tasksByBlockId: baseState.tasksByBlockId,
    conclusionPanel:
      reviewedBlock && review
        ? buildConclusionPanelProps(
            reviewedBlock,
            review,
            baseState.tasksByBlockId[reviewedBlock.id] ?? [],
          )
        : null,
  };
}

export async function loadChronosInsightsState(
  repositories: ChronosAppRepositories,
  userId: string,
): Promise<ChronosInsightsState> {
  const blocks = await loadUserBlocks(repositories, userId);
  const actualEntries = (await repositories.actualTimeEntries.listForUser(userId)).filter(
    (entry) => entry.userId === userId,
  );

  return {
    weeklyInsight: buildWeeklyInsightProps(blocks, actualEntries),
  };
}

async function loadChronosBaseState(
  repositories: ChronosAppRepositories,
  userId: string,
  now: Clock,
): Promise<ChronosBaseState> {
  const nowIso = now();
  const [blocks, allTasks] = await Promise.all([
    loadUserBlocks(repositories, userId),
    repositories.tasks.listForUser(userId),
  ]);

  const tasks = allTasks.filter((task) => task.userId === userId);
  const todayDate = selectTodayDate(nowIso);
  const tasksByBlockId = groupTasksByBlockId(tasks);

  return {
    blocks,
    planningBlocks: blocks.filter((block) => block.phase === 'planning'),
    executionBlocks: blocks.filter((block) => block.phase === 'execution'),
    assignableTasks: tasks.filter((task) => task.blockId === null),
    tasksByBlockId,
    todayDate,
    tasks,
    nowIso,
  };
}

async function loadUserBlocks(
  repositories: ChronosAppRepositories,
  userId: string,
): Promise<Block[]> {
  const allBlocks = await repositories.blocks.listForUser(userId);

  return orderBlocksForChronogram(allBlocks.filter((block) => block.userId === userId));
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
    case 'today-save-goals': {
      const goalDate = selectTodayDate(now());
      const goals = normalizeTodayGoalTitles(readStringList(formData, 'goals'));
      await repositories.todayGoals.replaceForDay({ userId, goalDate }, goals);

      return { status: 'goals-saved' };
    }
    case 'today-set-task-status': {
      const status = readTaskStatus(formData);
      await repositories.tasks.updateStatus({
        userId,
        taskId: requireFormString(formData, 'taskId'),
        status,
      });

      return { status: 'task-updated' };
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
  const carryOverBlocks = blocks.filter(
    (block) => block.phase === 'execution' && getDateKey(block.plannedStart) < date,
  );
  const timelineBlocks = uniqueBlocks([...dailyBlocks, ...carryOverBlocks]);
  const dailyPauses = timelineBlocks.flatMap((block) => pausesByBlockId.get(block.id) ?? []);
  const currentTime = getDateKey(nowIso) === date ? nowIso : null;
  const window = getCenteredTimelineWindow(date, nowIso, currentTime);

  return {
    eyebrow: `Today · ${date}`,
    title: "Today's timeline",
    description: 'Blocks, pauses, and the current time for this day.',
    ...window,
    currentTime,
    blocks: timelineBlocks.map((block) => {
      const isCarryOver = carryOverBlocks.some((carryOverBlock) => carryOverBlock.id === block.id);
      const blockPauses = pausesByBlockId.get(block.id) ?? [];
      const displayInterval = getTimelineBlockDisplayInterval(
        block,
        isCarryOver,
        window,
        currentTime,
        blockPauses,
      );

      return {
        id: block.id,
        title: block.title,
        category: block.category,
        phase: block.phase,
        plannedStart: block.plannedStart,
        plannedEnd: block.plannedEnd,
        ...displayInterval,
        ...(isCarryOver ? { note: 'Started before today; still running.' } : {}),
      };
    }),
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

type TodayBlockSelection = {
  dailyBlocks: Block[];
  currentBlock: Block | null;
  nextBlock: Block | null;
  selectedBlock: Block | null;
};

function getTimelineBlockDisplayInterval(
  block: Block,
  isCarryOver: boolean,
  window: { visibleStart: string; visibleEnd: string },
  currentTime: string | null,
  pauses: readonly Pause[],
): { displayStart?: string; displayEnd?: string } {
  if (isCarryOver) {
    return {
      displayStart: window.visibleStart,
      displayEnd: window.visibleEnd,
    };
  }

  if (block.phase !== 'execution' || !currentTime) {
    return {};
  }

  const currentMs = Date.parse(currentTime);
  const plannedStartMs = Date.parse(block.plannedStart);
  const plannedEndMs = Date.parse(block.plannedEnd);
  const earliestVisiblePauseStart = getEarliestVisiblePauseStart(pauses, window, currentTime);

  if (currentMs < plannedStartMs) {
    return {
      displayStart: earliestVisiblePauseStart ?? currentTime,
      displayEnd: block.plannedEnd,
    };
  }

  const displayStart =
    earliestVisiblePauseStart && Date.parse(earliestVisiblePauseStart) < plannedStartMs
      ? earliestVisiblePauseStart
      : block.plannedStart;

  if (currentMs > plannedEndMs) {
    return { displayStart, displayEnd: currentTime };
  }

  return displayStart === block.plannedStart ? {} : { displayStart };
}

function getEarliestVisiblePauseStart(
  pauses: readonly Pause[],
  window: { visibleStart: string; visibleEnd: string },
  currentTime: string,
): string | null {
  const currentMs = Date.parse(currentTime);
  const visibleStartMs = Date.parse(window.visibleStart);
  const visibleEndMs = Date.parse(window.visibleEnd);
  let earliestVisiblePauseStartMs: number | null = null;

  for (const pause of pauses) {
    const pauseStartMs = Date.parse(pause.startedAt);
    const pauseEndMs = Date.parse(pause.endedAt ?? currentTime);

    if (pauseStartMs >= currentMs || pauseEndMs <= visibleStartMs || pauseStartMs >= visibleEndMs) {
      continue;
    }

    const visiblePauseStartMs = Math.max(pauseStartMs, visibleStartMs);

    if (earliestVisiblePauseStartMs === null || visiblePauseStartMs < earliestVisiblePauseStartMs) {
      earliestVisiblePauseStartMs = visiblePauseStartMs;
    }
  }

  return earliestVisiblePauseStartMs === null
    ? null
    : new Date(earliestVisiblePauseStartMs).toISOString();
}

function selectTodayBlocks(
  dailyBlocks: Block[],
  carryOverBlocks: Block[],
  nowIso: string,
): TodayBlockSelection {
  const sortedDailyBlocks = orderBlocksForChronogram(dailyBlocks);
  const sortedCarryOverBlocks = orderBlocksForChronogram(carryOverBlocks);
  const operationalDailyBlocks = sortedDailyBlocks.filter((block) => block.phase !== 'conclusion');
  const nowMs = Date.parse(nowIso);
  const timeCurrentBlock = operationalDailyBlocks.find(
    (block) => Date.parse(block.plannedStart) <= nowMs && nowMs < Date.parse(block.plannedEnd),
  );
  const runningBlock = [...operationalDailyBlocks, ...sortedCarryOverBlocks].find(
    (block) => block.phase === 'execution',
  );
  const currentBlock = runningBlock ?? timeCurrentBlock ?? null;
  const nextBlock =
    operationalDailyBlocks.find(
      (block) => block.id !== currentBlock?.id && Date.parse(block.plannedStart) > nowMs,
    ) ?? null;

  return {
    dailyBlocks: sortedDailyBlocks,
    currentBlock,
    nextBlock,
    selectedBlock: currentBlock ?? nextBlock ?? sortedDailyBlocks[0] ?? null,
  };
}

function buildTodayOperatingSummary(
  todayDate: string,
  nowIso: string,
  selection: TodayBlockSelection,
): TodayOperatingSummaryProps {
  const { currentBlock, dailyBlocks, nextBlock, selectedBlock } = selection;
  const openTime = calculateOpenTime(todayDate, nowIso, currentBlock, nextBlock);

  return {
    date: todayDate,
    nowLabel: getTimeInputValue(nowIso),
    now: currentBlock
      ? {
          label: 'Now',
          title: currentBlock.title,
          detail:
            currentBlock.phase === 'execution' &&
            Date.parse(nowIso) >= Date.parse(currentBlock.plannedEnd)
              ? `Running overtime since ${getTimeInputValue(currentBlock.plannedEnd)}.`
              : `${currentBlock.phase === 'execution' ? 'Running' : 'Planned now'} until ${getTimeInputValue(currentBlock.plannedEnd)}.`,
          status: currentBlock.phase === 'execution' ? 'running' : 'planned-now',
        }
      : {
          label: 'Now',
          title: 'Open time',
          detail:
            dailyBlocks.length === 0
              ? 'No blocks are planned for today.'
              : 'No block is active right now.',
          status: 'open-time',
        },
    next: nextBlock
      ? {
          label: 'Next',
          title: nextBlock.title,
          detail: `Starts at ${getTimeInputValue(nextBlock.plannedStart)}.`,
          blockId: nextBlock.id,
        }
      : {
          label: 'Next',
          title: 'No next block',
          detail: 'Nothing else is planned today.',
          blockId: null,
        },
    openTime: {
      label: 'Open time',
      title:
        openTime.minutes === null
          ? 'No open gap calculated'
          : `${formatMinutes(openTime.minutes)} ${openTime.title}`,
      detail: openTime.detail,
      minutes: openTime.minutes,
    },
    currentBlockId: currentBlock?.id ?? null,
    selectedBlockId: selectedBlock?.id ?? null,
  };
}

function calculateOpenTime(
  todayDate: string,
  nowIso: string,
  currentBlock: Block | null,
  nextBlock: Block | null,
): { title: string; detail: string; minutes: number | null } {
  const startMs = currentBlock
    ? Math.max(Date.parse(nowIso), Date.parse(currentBlock.plannedEnd))
    : Date.parse(nowIso);
  const endIso = nextBlock?.plannedStart ?? `${todayDate}T23:59:59.999Z`;
  const minutes = Math.max(0, Math.round((Date.parse(endIso) - startMs) / 60_000));

  if (nextBlock) {
    return {
      title: currentBlock ? 'after this block' : 'until next block',
      detail: currentBlock
        ? `Next open gap before ${nextBlock.title}.`
        : `Open until ${nextBlock.title}.`,
      minutes,
    };
  }

  return {
    title: 'left today',
    detail: 'Open time until the day ends.',
    minutes,
  };
}

function buildTodayTaskPanel(
  tasks: ChronosTask[],
  dailyBlocks: Block[],
  currentBlock: Block | null,
): TodayTaskPanelProps {
  const dailyBlockById = new Map(dailyBlocks.map((block) => [block.id, block]));
  const todayTasks: TodayTaskPanelTask[] = tasks
    .filter((task) => task.blockId === null || dailyBlockById.has(task.blockId))
    .map((task) => {
      const block = task.blockId ? (dailyBlockById.get(task.blockId) ?? null) : null;
      const placement: TodayTaskPanelProps['tasks'][number]['placement'] =
        task.blockId === currentBlock?.id
          ? 'current-block'
          : task.blockId && block
            ? 'today-block'
            : 'unassigned';

      return {
        id: task.id,
        title: task.title,
        status: task.status,
        placement,
        blockId: task.blockId,
        blockTitle: block?.title ?? null,
      };
    });

  return {
    title: 'Today tasks',
    description: 'Place open work into the block you are running now.',
    currentBlockId: currentBlock?.id ?? null,
    currentBlockTitle: currentBlock?.title ?? null,
    actionPath: '/app/today',
    tasks: todayTasks,
  };
}

function getCenteredTimelineWindow(
  date: string,
  nowIso: string,
  currentTime: string | null,
): { visibleStart: string; visibleEnd: string } {
  if (!currentTime) {
    return { visibleStart: `${date}T08:00:00.000Z`, visibleEnd: `${date}T20:00:00.000Z` };
  }

  const dayStartMs = Date.parse(`${date}T00:00:00.000Z`);
  const dayEndMs = Date.parse(`${date}T23:59:59.999Z`);
  const windowMs = 8 * 60 * 60 * 1000;
  const halfWindowMs = windowMs / 2;
  const nowMs = Date.parse(nowIso);
  let visibleStartMs = nowMs - halfWindowMs;
  let visibleEndMs = nowMs + halfWindowMs;

  if (visibleStartMs < dayStartMs) {
    visibleStartMs = dayStartMs;
    visibleEndMs = Math.min(dayEndMs, dayStartMs + windowMs);
  }

  if (visibleEndMs > dayEndMs) {
    visibleEndMs = dayEndMs;
    visibleStartMs = Math.max(dayStartMs, dayEndMs - windowMs);
  }

  return {
    visibleStart: new Date(visibleStartMs).toISOString(),
    visibleEnd: new Date(visibleEndMs).toISOString(),
  };
}

function getQuickBlockDefaults(nowIso: string): TodayQuickBlockDefaults {
  const nowMs = Date.parse(nowIso);
  const date = getDateKey(nowIso);
  const dayStartMs = Date.parse(`${date}T00:00:00.000Z`);
  const dayEndMs = Date.parse(`${date}T23:59:00.000Z`);
  const quarterHourMs = 15 * 60_000;
  const defaultDurationMs = 60 * 60_000;
  const latestStartMs = Date.parse(`${date}T23:45:00.000Z`);
  const roundedStartMs = Math.ceil(nowMs / quarterHourMs) * quarterHourMs;
  const startMs = Math.min(Math.max(roundedStartMs, dayStartMs), latestStartMs);
  const endMs = Math.min(startMs + defaultDurationMs, dayEndMs);
  const start = new Date(startMs);
  const end = new Date(endMs);

  return {
    date,
    startTime: getTimeInputValue(start.toISOString()),
    endTime: getTimeInputValue(end.toISOString()),
  };
}

function formatMinutes(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
  }

  return `${minutes}m`;
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
    title: 'Weekly plan',
    description: 'Planned blocks and highlighted events for the week.',
    visibleStart: `${weekStart}T00:00:00.000Z`,
    visibleEnd: `${weekStart}T23:59:59.999Z`,
    days,
  };
}

function buildTaskListProps(tasks: ChronosTask[]): TaskListProps {
  return {
    eyebrow: 'Backlog',
    title: 'Unassigned tasks',
    description: 'Tasks waiting for a planning block.',
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
    title: 'Selected block',
    description: 'Tasks, highlighted events, and pause controls for this block.',
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
      note: event.occurredAt ? `Occurred ${formatEventTimestamp(event.occurredAt)}` : undefined,
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
    eyebrow: 'Last review',
    title: 'Last review',
    description: 'Conclusion notes, completed tasks, and timing for this block.',
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

function buildWeeklyInsightProps(
  blocks: Block[],
  actualEntries: ActualTimeEntry[],
): WeeklyInsightProps {
  return {
    eyebrow: 'Weekly summary',
    title: 'Week summary',
    description: 'Planned time compared with actual time by category, block, and phase.',
    summary: calculatePlannedVsActual(blocks, actualEntries),
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

async function loadBlockEvents(
  repositories: ChronosAppRepositories,
  userId: string,
  blocks: Block[],
): Promise<Map<string, ChronosEvent[]>> {
  const entries = await Promise.all(
    blocks.map(
      async (block) =>
        [block.id, await repositories.events.listForBlock({ userId, blockId: block.id })] as const,
    ),
  );

  return new Map(entries);
}

async function selectReviewedBlock(
  repositories: ChronosAppRepositories,
  userId: string,
  blocks: Block[],
): Promise<Block | null> {
  const concludedBlocks = blocks.filter((block) => block.phase === 'conclusion');

  for (const block of concludedBlocks) {
    const review = await repositories.conclusionReviews.findForBlock({ userId, blockId: block.id });

    if (review) {
      return block;
    }
  }

  return null;
}

function uniqueBlocks(blocks: Block[]): Block[] {
  return Array.from(new Map(blocks.map((block) => [block.id, block])).values());
}

function selectPrimaryBlock(blocks: Block[]): Block | null {
  return (
    blocks.find((block) => block.phase === 'execution') ??
    blocks.find((block) => block.phase === 'planning') ??
    blocks.find((block) => block.phase === 'conclusion') ??
    null
  );
}

function selectTodayDate(nowIso: string): string {
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
    throw new Error('Block was not found for this account.');
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
    throw new Error('Pause was not found for this account.');
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

function readTaskStatus(formData: FormData): TaskStatus {
  const status = requireFormString(formData, 'status');

  if (!taskStatuses.includes(status as TaskStatus)) {
    throw new Error('Task status is invalid.');
  }

  return status as TaskStatus;
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

function normalizeTodayGoalTitles(goals: readonly string[]): string[] {
  return goals
    .map((goal) => goal.trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 3);
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

function formatEventTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date(iso));
}

export { categoryLabels };
