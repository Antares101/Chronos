import type { ActualTimeEntry, Block, BlockCategory, BlockPhase } from '../models';
import { minutesBetween } from './lifecycle';

export type PlannedVsActualMetric = {
  key: string;
  plannedMinutes: number;
  actualMinutes: number;
  deltaMinutes: number;
};

export type PlannedVsActualSummary = {
  byCategory: Record<BlockCategory, PlannedVsActualMetric>;
  byBlock: Record<string, PlannedVsActualMetric>;
  byPhase: Record<BlockPhase, PlannedVsActualMetric>;
};

const categories: BlockCategory[] = ['work', 'home', 'training'];
const phases: BlockPhase[] = ['planning', 'execution', 'conclusion'];

export function calculatePlannedVsActual(
  blocks: Block[],
  actualEntries: ActualTimeEntry[],
): PlannedVsActualSummary {
  const blockById = new Map(blocks.map((block) => [block.id, block]));
  const byCategory = Object.fromEntries(
    categories.map((category) => [category, emptyMetric(category)]),
  ) as Record<BlockCategory, PlannedVsActualMetric>;
  const byPhase = Object.fromEntries(phases.map((phase) => [phase, emptyMetric(phase)])) as Record<
    BlockPhase,
    PlannedVsActualMetric
  >;
  const byBlock: Record<string, PlannedVsActualMetric> = {};

  for (const block of blocks) {
    const plannedMinutes = minutesBetween(block.plannedStart, block.plannedEnd);
    byBlock[block.id] = {
      key: block.id,
      plannedMinutes,
      actualMinutes: 0,
      deltaMinutes: -plannedMinutes,
    };
    byCategory[block.category].plannedMinutes += plannedMinutes;
    byPhase[block.phase].plannedMinutes += plannedMinutes;
  }

  for (const entry of actualEntries) {
    const block = blockById.get(entry.blockId);

    if (!block) {
      continue;
    }

    const actualMinutes = minutesBetween(entry.startedAt, entry.endedAt);
    byBlock[entry.blockId].actualMinutes += actualMinutes;
    byCategory[block.category].actualMinutes += actualMinutes;
    byPhase[entry.phase].actualMinutes += actualMinutes;
  }

  recalculateDeltas(Object.values(byCategory));
  recalculateDeltas(Object.values(byBlock));
  recalculateDeltas(Object.values(byPhase));

  return { byCategory, byBlock, byPhase };
}

function emptyMetric(key: string): PlannedVsActualMetric {
  return {
    key,
    plannedMinutes: 0,
    actualMinutes: 0,
    deltaMinutes: 0,
  };
}

function recalculateDeltas(metrics: PlannedVsActualMetric[]): void {
  for (const metric of metrics) {
    metric.deltaMinutes = metric.actualMinutes - metric.plannedMinutes;
  }
}
