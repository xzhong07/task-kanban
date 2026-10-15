export const TASK_STATUSES = [
  { value: "todo", label: "未着手" },
  { value: "in_progress", label: "進行中" },
  { value: "done", label: "完了" },
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number]["value"];

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
};

export type TaskInput = {
  title: string;
  description: string;
  status: string;
};

export type ValidTaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
};

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
