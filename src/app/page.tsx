import { Suspense } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { getTasks } from "@/lib/tasks/queries";
import type { Task } from "@/lib/tasks/types";
import { createTask, deleteTask, updateTask } from "./actions";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold">タスクカンバン</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">読み込み中…</p>}>
        <TaskBoardLoader />
      </Suspense>
    </main>
  );
}

async function TaskBoardLoader() {
  let tasks: Task[] | null = null;
  try {
    tasks = await getTasks();
  } catch {
    // 取得失敗時は下でエラーメッセージを表示する
  }

  if (tasks === null) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        タスクを読み込めませんでした。時間をおいて再度お試しください。
      </p>
    );
  }

  return <KanbanBoard initialTasks={tasks} actions={{ createTask, updateTask, deleteTask }} />;
}
