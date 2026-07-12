import type { TodayTaskPanelProps } from './TodayTaskPanel';
import TodayTaskPanel from './TodayTaskPanel';

export type TodayOpenTaskShelfProps = {
  panel: TodayTaskPanelProps;
  rowTaskIds: readonly string[];
};

export default function TodayOpenTaskShelf({ panel, rowTaskIds }: TodayOpenTaskShelfProps) {
  const shown = new Set(rowTaskIds);
  const shelfIds = new Set<string>();
  const tasks = panel.tasks.filter((task) => {
    if (shown.has(task.id) || shelfIds.has(task.id)) return false;
    shelfIds.add(task.id);
    return true;
  });

  return <TodayTaskPanel {...panel} tasks={tasks} />;
}
