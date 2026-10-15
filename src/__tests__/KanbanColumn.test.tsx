import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { TASK_STATUSES, type ActionResult, type Task } from "@/lib/tasks/types";

afterEach(() => {
  cleanup();
});

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "買い物",
    description: "",
    status: "todo",
    createdAt: "2026-10-15T00:00:00Z",
    ...overrides,
  };
}

const todo = TASK_STATUSES[0];
const inProgress = TASK_STATUSES[1];

function renderColumn(status: (typeof TASK_STATUSES)[number], tasks: Task[]) {
  render(
    <KanbanColumn
      status={status}
      tasks={tasks}
      onUpdate={vi.fn(async (): Promise<ActionResult<Task>> => ({ ok: true, data: makeTask() }))}
      onDelete={vi.fn(
        async (id: string): Promise<ActionResult<{ id: string }>> => ({ ok: true, data: { id } }),
      )}
    />,
  );
  return screen.getByRole("region", { name: status.label });
}

describe("KanbanColumn", () => {
  test("ステータスのラベルを名前に持つ列として表示される", () => {
    renderColumn(inProgress, []);

    expect(screen.getByRole("region", { name: "進行中" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "進行中" })).toBeDefined();
  });

  test("タスクが0件のときは件数0と空であることが表示され、カードは無い", () => {
    const column = renderColumn(todo, []);

    expect(within(column).getByText("0")).toBeDefined();
    expect(within(column).getByText("タスクはありません")).toBeDefined();
    expect(within(column).queryByRole("article")).toBeNull();
  });

  test("タスクが1件のときは件数1とそのカードが表示され、空表示は出ない", () => {
    const column = renderColumn(todo, [makeTask()]);

    expect(within(column).getByText("1")).toBeDefined();
    expect(within(column).getByRole("article", { name: "買い物" })).toBeDefined();
    expect(within(column).queryByText("タスクはありません")).toBeNull();
  });

  test("複数のタスクは件数とともに渡した順序どおりに並ぶ", () => {
    const column = renderColumn(todo, [
      makeTask({ id: "1", title: "買い物" }),
      makeTask({ id: "2", title: "掃除" }),
      makeTask({ id: "3", title: "洗濯" }),
    ]);

    expect(within(column).getByText("3")).toBeDefined();
    expect(
      within(column)
        .getAllByRole("article")
        .map((card) => card.getAttribute("aria-label")),
    ).toEqual(["買い物", "掃除", "洗濯"]);
  });
});
