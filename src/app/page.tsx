import { Suspense } from "react";
import { LayoutGrid, Loader2 } from "lucide-react";
import { ErrorAlert } from "@/components/kanban/ErrorAlert";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { getTasks } from "@/lib/tasks/queries";
import type { Task } from "@/lib/tasks/types";
import { createTask, deleteTask, updateTask } from "./actions";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LayoutGrid aria-hidden="true" className="size-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">タスクカンバン</h1>
          <p className="text-sm text-muted-foreground">タスクを追加して、進み具合ごとに管理しましょう</p>
        </div>
      </header>
      <Suspense
        fallback={
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            読み込み中…
          </p>
        }
      >
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
    return <ErrorAlert message="タスクを読み込めませんでした。時間をおいて再度お試しください。" />;
  }

  return <KanbanBoard initialTasks={tasks} actions={{ createTask, updateTask, deleteTask }} />;
}
