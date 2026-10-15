"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionResult, Task, TaskInput } from "@/lib/tasks/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { ErrorAlert } from "./ErrorAlert";
import { TaskCardActions } from "./TaskCardActions";
import { TaskForm } from "./TaskForm";

type TaskCardProps = {
  task: Task;
  onUpdate: (id: string, input: TaskInput) => Promise<ActionResult<Task>>;
  onDelete: (id: string) => Promise<ActionResult<{ id: string }>>;
};

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleUpdate(input: TaskInput) {
    const result = await onUpdate(task.id, input);
    if (result.ok) setIsEditing(false);
    return result;
  }

  async function handleConfirmDelete() {
    setIsConfirming(false);
    setDeleteError(null);
    setIsDeleting(true);
    const result = await onDelete(task.id);
    if (!result.ok) {
      setIsDeleting(false);
      setDeleteError(result.error);
    }
  }

  return (
    <article aria-label={task.title}>
      <Card
        size="sm"
        className="shadow-xs transition-shadow hover:shadow-md data-[deleting=true]:opacity-60"
        data-deleting={isDeleting}
      >
        {isEditing ? (
          <CardContent>
            <TaskForm
              label={`「${task.title}」を編集`}
              initialValues={{
                title: task.title,
                description: task.description,
                status: task.status,
              }}
              submitLabel="保存"
              pendingLabel="保存中…"
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="break-words">{task.title}</CardTitle>
              {task.description && (
                <CardDescription className="whitespace-pre-wrap break-words">
                  {task.description}
                </CardDescription>
              )}
              <TaskCardActions
                isDeleting={isDeleting}
                onEdit={() => setIsEditing(true)}
                onDelete={() => setIsConfirming(true)}
              />
            </CardHeader>
            {deleteError && (
              <CardContent>
                <ErrorAlert message={deleteError} />
              </CardContent>
            )}
          </>
        )}
      </Card>
      {isConfirming && (
        <ConfirmDialog
          title="タスクの削除"
          message={`「${task.title}」を削除しますか？`}
          confirmLabel="削除する"
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </article>
  );
}
