"use client";

import { Inbox, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, type Task, type TaskInput, type TaskStatus } from "@/lib/tasks/types";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { useKanbanTasks, type KanbanActions } from "./useKanbanTasks";

export type { KanbanActions };

type KanbanBoardProps = {
  initialTasks: Task[];
  actions: KanbanActions;
};

const emptyInput: TaskInput = { title: "", description: "", status: "todo" };

const statusDotClassName: Record<TaskStatus, string> = {
  todo: "bg-muted-foreground/40",
  in_progress: "bg-chart-2",
  done: "bg-primary",
};

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
        {TASK_STATUSES.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status.value);
          const headingId = `column-${status.value}`;
          return (
            <section
              key={status.value}
              aria-labelledby={headingId}
              className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/5"
            >
              <div className="flex items-center gap-2 px-1">
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full", statusDotClassName[status.value])}
                />
                <h2 id={headingId} className="text-sm font-semibold">
                  {status.label}
                </h2>
                <Badge variant="secondary" className="ml-auto tabular-nums">
                  {columnTasks.length}
                </Badge>
              </div>
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-3 py-8 text-sm text-muted-foreground">
                  <Inbox aria-hidden="true" className="size-5" />
                  <p>タスクはありません</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
