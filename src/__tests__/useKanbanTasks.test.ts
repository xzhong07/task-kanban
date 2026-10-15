import { describe, expect, test, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useKanbanTasks, type KanbanActions } from "@/components/kanban/useKanbanTasks";
import type { ActionResult, Task, TaskInput } from "@/lib/tasks/types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "買い物",
    description: "牛乳を買う",
    status: "todo",
    createdAt: "2026-10-15T00:00:00Z",
    ...overrides,
  };
}

function makeActions(overrides: Partial<KanbanActions> = {}): KanbanActions {
  return {
    createTask: vi.fn(
      async (input: TaskInput): Promise<ActionResult<Task>> => ({
        ok: true,
        data: makeTask({ id: "new-task", title: input.title }),
      }),
    ),
    updateTask: vi.fn(
      async (id: string, input: TaskInput): Promise<ActionResult<Task>> => ({
        ok: true,
        data: makeTask({ id, title: input.title, status: input.status as Task["status"] }),
      }),
    ),
    deleteTask: vi.fn(
      async (id: string): Promise<ActionResult<{ id: string }>> => ({ ok: true, data: { id } }),
    ),
    ...overrides,
  };
}

function failWith(error: string) {
  return vi.fn(async () => ({ ok: false as const, error }));
}

const input: TaskInput = { title: "洗濯", description: "", status: "todo" };

const initialTasks = [
  makeTask({ id: "1", title: "買い物" }),
  makeTask({ id: "2", title: "掃除" }),
];

describe("useKanbanTasks", () => {
  test("初期状態では渡したタスクがそのまま返る", () => {
    const { result } = renderHook(() => useKanbanTasks(initialTasks, makeActions()));

    expect(result.current.tasks).toEqual(initialTasks);
  });

  test("追加に成功すると、作成されたタスクが末尾に加わり結果が返る", async () => {
    const actions = makeActions();
    const { result } = renderHook(() => useKanbanTasks(initialTasks, actions));

    let returned: ActionResult<Task> | undefined;
    await act(async () => {
      returned = await result.current.createTask(input);
    });

    expect(actions.createTask).toHaveBeenCalledWith(input);
    expect(result.current.tasks.map((task) => task.id)).toEqual(["1", "2", "new-task"]);
    expect(returned?.ok).toBe(true);
  });

  test("更新に成功すると、対象のタスクだけが置き換わり順序は保たれる", async () => {
    const actions = makeActions();
    const { result } = renderHook(() => useKanbanTasks(initialTasks, actions));

    await act(async () => {
      await result.current.updateTask("1", { ...input, title: "まとめ買い", status: "done" });
    });

    expect(result.current.tasks.map((task) => [task.id, task.title, task.status])).toEqual([
      ["1", "まとめ買い", "done"],
      ["2", "掃除", "todo"],
    ]);
  });

  test("削除に成功すると、対象のタスクだけが取り除かれる", async () => {
    const actions = makeActions();
    const { result } = renderHook(() => useKanbanTasks(initialTasks, actions));

    await act(async () => {
      await result.current.deleteTask("1");
    });

    expect(actions.deleteTask).toHaveBeenCalledWith("1");
    expect(result.current.tasks.map((task) => task.id)).toEqual(["2"]);
  });

  test("最後の1件を削除すると、タスクは0件になる", async () => {
    const { result } = renderHook(() =>
      useKanbanTasks([makeTask({ id: "1" })], makeActions()),
    );

    await act(async () => {
      await result.current.deleteTask("1");
    });

    expect(result.current.tasks).toEqual([]);
  });

  test("追加に失敗すると、タスクは変わらずエラーの結果が返る", async () => {
    const actions = makeActions({ createTask: failWith("タスクの追加に失敗しました") });
    const { result } = renderHook(() => useKanbanTasks(initialTasks, actions));

    let returned: ActionResult<Task> | undefined;
    await act(async () => {
      returned = await result.current.createTask(input);
    });

    expect(result.current.tasks).toEqual(initialTasks);
    expect(returned).toEqual({ ok: false, error: "タスクの追加に失敗しました" });
  });

  test("更新に失敗すると、タスクは変わらずエラーの結果が返る", async () => {
    const actions = makeActions({ updateTask: failWith("タスクの更新に失敗しました") });
    const { result } = renderHook(() => useKanbanTasks(initialTasks, actions));

    let returned: ActionResult<Task> | undefined;
    await act(async () => {
      returned = await result.current.updateTask("1", input);
    });

    expect(result.current.tasks).toEqual(initialTasks);
    expect(returned).toEqual({ ok: false, error: "タスクの更新に失敗しました" });
  });

  test("削除に失敗すると、タスクは変わらずエラーの結果が返る", async () => {
    const actions = makeActions({ deleteTask: failWith("タスクの削除に失敗しました") });
    const { result } = renderHook(() => useKanbanTasks(initialTasks, actions));

    let returned: ActionResult<{ id: string }> | undefined;
    await act(async () => {
      returned = await result.current.deleteTask("1");
    });

    expect(result.current.tasks).toEqual(initialTasks);
    expect(returned).toEqual({ ok: false, error: "タスクの削除に失敗しました" });
  });

  test("存在しない id を削除しても、他のタスクは変わらない", async () => {
    const { result } = renderHook(() => useKanbanTasks(initialTasks, makeActions()));

    await act(async () => {
      await result.current.deleteTask("unknown");
    });

    expect(result.current.tasks).toEqual(initialTasks);
  });

  test("存在しない id を更新しても、他のタスクは変わらない", async () => {
    const { result } = renderHook(() => useKanbanTasks(initialTasks, makeActions()));

    await act(async () => {
      await result.current.updateTask("unknown", input);
    });

    expect(result.current.tasks).toEqual(initialTasks);
  });
});
