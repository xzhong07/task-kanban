import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import type { Task } from "./types";
import { isTaskStatus } from "./validation";

export const TASK_COLUMNS = "id, title, description, status, created_at";

type TaskRow = Pick<Tables<"tasks">, "id" | "title" | "description" | "status" | "created_at">;

export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: isTaskStatus(row.status) ? row.status : "todo",
    createdAt: row.created_at,
  };
}

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("タスクの取得に失敗しました");
  }
  return data.map(toTask);
}
