"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TaskInput } from "@/lib/tasks/types";
import { TaskForm } from "./TaskForm";
import type { KanbanActions } from "./useKanbanTasks";

type NewTaskPanelProps = {
  onCreate: KanbanActions["createTask"];
};

const emptyInput: TaskInput = { title: "", description: "", status: "todo" };

export function NewTaskPanel({ onCreate }: NewTaskPanelProps) {
  return (
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
          onSubmit={onCreate}
          resetOnSuccess
        />
      </CardContent>
    </Card>
  );
}
