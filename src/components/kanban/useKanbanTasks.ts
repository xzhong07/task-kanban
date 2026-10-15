"use client";

import { useState } from "react";
import type { ActionResult, Task, TaskInput } from "@/lib/tasks/types";

export type KanbanActions = {
  createTask: (input: TaskInput) => Promise<ActionResult<Task>>;
  updateTask: (id: string, input: TaskInput) => Promise<ActionResult<Task>>;
  deleteTask: (id: string) => Promise<ActionResult<{ id: string }>>;
};

export function useKanbanTasks(initialTasks: Task[], actions: KanbanActions) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  async function createTask(input: TaskInput) {
    const result = await actions.createTask(input);
    if (result.ok) {
      setTasks((current) => [...current, result.data]);
    }
    return result;
  }

  async function updateTask(id: string, input: TaskInput) {
    const result = await actions.updateTask(id, input);
    if (result.ok) {
      setTasks((current) => current.map((task) => (task.id === id ? result.data : task)));
    }
    return result;
  }

  async function deleteTask(id: string) {
    const result = await actions.deleteTask(id);
    if (result.ok) {
      setTasks((current) => current.filter((task) => task.id !== id));
    }
    return result;
  }

  return { tasks, createTask, updateTask, deleteTask };
}
