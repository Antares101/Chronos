import type { ActualTimeEntry, Block, BlockCategory, BlockPhase } from '../models';
import { calculateNonOverlappingActualMinutes, minutesBetween } from './lifecycle';

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

  const actualEntriesByBlockId = new Map<string, ActualTimeEntry[]>();
  const actualEntriesByPhase = new Map<BlockPhase, Map<string, ActualTimeEntry[]>>(
    phases.map((phase) => [phase, new Map<string, ActualTimeEntry[]>()]),
  );

  for (const entry of actualEntries) {
    const block = blockById.get(entry.blockId);

    if (!block) {
      continue;
    }

    appendActualEntry(actualEntriesByBlockId, entry.blockId, entry);
    const entriesByBlockForPhase = actualEntriesByPhase.get(entry.phase);

    if (entriesByBlockForPhase) {
      appendActualEntry(entriesByBlockForPhase, entry.blockId, entry);
    }
  }

  for (const [blockId, entries] of actualEntriesByBlockId) {
    const block = blockById.get(blockId);

    if (!block) {
      continue;
    }

    const actualMinutes = calculateNonOverlappingActualMinutes(entries);
    byBlock[blockId].actualMinutes += actualMinutes;
    byCategory[block.category].actualMinutes += actualMinutes;
  }

  for (const [phase, entriesByBlockId] of actualEntriesByPhase) {
    for (const entries of entriesByBlockId.values()) {
      byPhase[phase].actualMinutes += calculateNonOverlappingActualMinutes(entries);
    }
  }

  recalculateDeltas(Object.values(byCategory));
  recalculateDeltas(Object.values(byBlock));
  recalculateDeltas(Object.values(byPhase));

  return { byCategory, byBlock, byPhase };
}

function appendActualEntry(
  entriesByBlockId: Map<string, ActualTimeEntry[]>,
  blockId: string,
  entry: ActualTimeEntry,
): void {
  entriesByBlockId.set(blockId, [...(entriesByBlockId.get(blockId) ?? []), entry]);
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
