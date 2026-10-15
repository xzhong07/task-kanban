"use client";

import { useState } from "react";
import type { ActionResult, Task, TaskInput } from "@/lib/tasks/types";
import { ConfirmDialog } from "./ConfirmDialog";
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
    <article
      aria-label={task.title}
      className="rounded-md border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {isEditing ? (
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
      ) : (
        <>
          <h3 className="font-medium break-words">{task.title}</h3>
          {task.description && (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>
          )}
          {deleteError && (
            <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
              {deleteError}
            </p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
              className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(true)}
              disabled={isDeleting}
              className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              {isDeleting ? "削除中…" : "削除"}
            </button>
          </div>
        </>
      )}
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
