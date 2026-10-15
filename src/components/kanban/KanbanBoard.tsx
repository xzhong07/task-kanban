"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TASK_STATUSES, type Task, type TaskInput } from "@/lib/tasks/types";
import { KanbanColumn } from "./KanbanColumn";
import { TaskForm } from "./TaskForm";
import { useKanbanTasks, type KanbanActions } from "./useKanbanTasks";

export type { KanbanActions };

type KanbanBoardProps = {
  initialTasks: Task[];
  actions: KanbanActions;
};

const emptyInput: TaskInput = { title: "", description: "", status: "todo" };

export function KanbanBoard({ initialTasks, actions }: KanbanBoardProps) {
  const {
    tasks,
    createTask: handleCreate,
    updateTask: handleUpdate,
    deleteTask: handleDelete,
  } = useKanbanTasks(initialTasks, actions);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus aria-hidden="true" className="size-4 text-muted-foreground" />
            新しいタスク
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            label="タスクを追加"
            initialValues={emptyInput}
            submitLabel="追加"
            pendingLabel="追加中…"
            onSubmit={handleCreate}
            resetOnSuccess
          />
        </CardContent>
      </Card>
      <div className="grid items-start gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status.value}
            status={status}
            tasks={tasks.filter((task) => task.status === status.value)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
