import type { TaskStatus } from '../../domain/models';

type TodayBlockTaskListProps = {
  actionPath: string;
  blockTitle: string;
  tasks: readonly { id: string; title: string; status: TaskStatus }[];
};

export default function TodayBlockTaskList({
  actionPath,
  blockTitle,
  tasks,
}: TodayBlockTaskListProps) {
  return (
    <ul className="today-block__tasks" aria-label={`Tasks for ${blockTitle}`}>
      {tasks.map((task) => (
        <li key={task.id}>
          <span>{task.title}</span>
          <span>{task.status === 'done' ? 'Done' : 'To do'}</span>
          <form method="post" action={actionPath}>
            <input type="hidden" name="action" value="today-set-task-status" />
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="status" value={task.status === 'todo' ? 'done' : 'todo'} />
            <button
              type="submit"
              aria-label={
                task.status === 'todo' ? `Mark ${task.title} done` : `Mark ${task.title} to do`
              }
            >
              {task.status === 'todo' ? 'Mark done' : 'Mark to do'}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
