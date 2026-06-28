import type { Block, BlockCategory, NewBlock, PlannedScheduleUpdate } from '../models';
import type { BlockQuery, BlockRepository } from '../repositories';
import { minutesBetween } from './lifecycle';

export type CreatePlannedBlockInput = {
  userId: string;
  title: string;
  category: BlockCategory;
  plannedStart: string;
  plannedEnd: string;
};

export type UpdatePlannedScheduleInput = BlockQuery & PlannedScheduleUpdate;

export async function createPlannedBlock(
  repository: Pick<BlockRepository, 'create'>,
  input: CreatePlannedBlockInput,
): Promise<Block> {
  assertValidPlannedRange(input);

  const newBlock: NewBlock = {
    userId: input.userId,
    title: input.title,
    category: input.category,
    plannedStart: input.plannedStart,
    plannedEnd: input.plannedEnd,
    phase: 'planning',
  };

  return repository.create(newBlock);
}

export async function updatePlannedBlockSchedule(
  repository: Pick<BlockRepository, 'findById' | 'updatePlannedSchedule'>,
  input: UpdatePlannedScheduleInput,
): Promise<Block> {
  assertValidPlannedRange(input);
  const block = await repository.findById({ userId: input.userId, blockId: input.blockId });

  if (!block) {
    throw new Error('Planned block was not found.');
  }

  if (block.phase !== 'planning') {
    throw new Error('Only planning blocks can be rescheduled.');
  }

  return repository.updatePlannedSchedule(
    { userId: input.userId, blockId: input.blockId },
    {
      plannedStart: input.plannedStart,
      plannedEnd: input.plannedEnd,
    },
  );
}

function assertValidPlannedRange(schedule: PlannedScheduleUpdate): void {
  const durationMinutes = minutesBetween(schedule.plannedStart, schedule.plannedEnd);

  if (durationMinutes <= 0) {
    throw new Error('End time must be after start time.');
  }
}
