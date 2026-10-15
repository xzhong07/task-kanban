"use client";

import { TASK_STATUSES, type Task } from "@/lib/tasks/types";
import { KanbanColumn } from "./KanbanColumn";
import { NewTaskPanel } from "./NewTaskPanel";
import { useKanbanTasks, type KanbanActions } from "./useKanbanTasks";

export type { KanbanActions };

type KanbanBoardProps = {
  initialTasks: Task[];
  actions: KanbanActions;
};

export function KanbanBoard({ initialTasks, actions }: KanbanBoardProps) {
  const { tasks, createTask, updateTask, deleteTask } = useKanbanTasks(initialTasks, actions);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
      <NewTaskPanel onCreate={createTask} />
      <div className="grid items-start gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status.value}
            status={status}
            tasks={tasks.filter((task) => task.status === status.value)}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        ))}
      </div>
    </div>
  );
}
