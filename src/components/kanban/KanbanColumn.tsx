"use client";

import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  ActionResult,
  Task,
  TASK_STATUSES,
  TaskInput,
  TaskStatus,
} from "@/lib/tasks/types";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  status: (typeof TASK_STATUSES)[number];
  tasks: Task[];
  onUpdate: (id: string, input: TaskInput) => Promise<ActionResult<Task>>;
  onDelete: (id: string) => Promise<ActionResult<{ id: string }>>;
};

const statusDotClassName: Record<TaskStatus, string> = {
  todo: "bg-muted-foreground/40",
  in_progress: "bg-chart-2",
  done: "bg-primary",
};

export function KanbanColumn({ status, tasks, onUpdate, onDelete }: KanbanColumnProps) {
  const headingId = `column-${status.value}`;
  return (
    <section
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
          {tasks.length}
        </Badge>
      </div>
      {tasks.length === 0 ? (
        <EmptyColumn />
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
        ))
      )}
    </section>
  );
}

function EmptyColumn() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-3 py-8 text-sm text-muted-foreground">
      <Inbox aria-hidden="true" className="size-5" />
      <p>タスクはありません</p>
    </div>
  );
}
