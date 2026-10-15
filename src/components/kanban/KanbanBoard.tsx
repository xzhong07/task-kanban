"use client";

import { useState } from "react";
import { TASK_STATUSES, type ActionResult, type Task, type TaskInput } from "@/lib/tasks/types";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";

export type KanbanActions = {
  createTask: (input: TaskInput) => Promise<ActionResult<Task>>;
  updateTask: (id: string, input: TaskInput) => Promise<ActionResult<Task>>;
  deleteTask: (id: string) => Promise<ActionResult<{ id: string }>>;
};

type KanbanBoardProps = {
  initialTasks: Task[];
  actions: KanbanActions;
};

const emptyInput: TaskInput = { title: "", description: "", status: "todo" };

export function KanbanBoard({ initialTasks, actions }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  async function handleCreate(input: TaskInput) {
    const result = await actions.createTask(input);
    if (result.ok) {
      setTasks((current) => [...current, result.data]);
    }
    return result;
  }

  async function handleUpdate(id: string, input: TaskInput) {
    const result = await actions.updateTask(id, input);
    if (result.ok) {
      setTasks((current) => current.map((task) => (task.id === id ? result.data : task)));
    }
    return result;
  }

  async function handleDelete(id: string) {
    const result = await actions.deleteTask(id);
    if (result.ok) {
      setTasks((current) => current.filter((task) => task.id !== id));
    }
    return result;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <TaskForm
          label="タスクを追加"
          initialValues={emptyInput}
          submitLabel="追加"
          pendingLabel="追加中…"
          onSubmit={handleCreate}
          resetOnSuccess
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status.value);
          const headingId = `column-${status.value}`;
          return (
            <section
              key={status.value}
              aria-labelledby={headingId}
              className="flex flex-col gap-3 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                <h2 id={headingId} className="font-semibold">
                  {status.label}
                </h2>
                <span className="text-sm text-zinc-500">{columnTasks.length}</span>
              </div>
              {columnTasks.length === 0 ? (
                <p className="text-sm text-zinc-500">タスクはありません</p>
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
