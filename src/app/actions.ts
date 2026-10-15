"use server";

import { createClient } from "@/lib/supabase/server";
import { TASK_COLUMNS, toTask } from "@/lib/tasks/queries";
import type { ActionResult, Task, TaskInput } from "@/lib/tasks/types";
import { validateTaskInput, type ValidationResult } from "@/lib/tasks/validation";

function toErrorMessage(result: Extract<ValidationResult, { ok: false }>): string {
  return Object.values(result.errors).join(" ");
}

export async function createTask(input: TaskInput): Promise<ActionResult<Task>> {
  const validation = validateTaskInput(input);
  if (!validation.ok) {
    return { ok: false, error: toErrorMessage(validation) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert(validation.data)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    return { ok: false, error: "タスクの追加に失敗しました" };
  }
  return { ok: true, data: toTask(data) };
}

export async function updateTask(
  id: string,
  input: TaskInput,
): Promise<ActionResult<Task>> {
  const validation = validateTaskInput(input);
  if (!validation.ok) {
    return { ok: false, error: toErrorMessage(validation) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(validation.data)
    .eq("id", id)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    return { ok: false, error: "タスクの更新に失敗しました" };
  }
  return { ok: true, data: toTask(data) };
}

export async function deleteTask(id: string): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return { ok: false, error: "タスクの削除に失敗しました" };
  }
  if (data.length === 0) {
    return { ok: false, error: "タスクが見つかりません" };
  }
  return { ok: true, data: { id } };
}
