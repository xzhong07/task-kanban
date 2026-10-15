import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard, type KanbanActions } from "@/components/kanban/KanbanBoard";
import type { ActionResult, Task, TaskInput } from "@/lib/tasks/types";

afterEach(() => {
  cleanup();
});

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

function taskFromInput(id: string, input: TaskInput): Task {
  return makeTask({
    id,
    title: input.title.trim(),
    description: input.description,
    status: input.status as Task["status"],
  });
}

function makeActions(overrides: Partial<KanbanActions> = {}): KanbanActions {
  return {
    createTask: vi.fn(
      async (input: TaskInput): Promise<ActionResult<Task>> => ({
        ok: true,
        data: taskFromInput("new-task", input),
      }),
    ),
    updateTask: vi.fn(
      async (id: string, input: TaskInput): Promise<ActionResult<Task>> => ({
        ok: true,
        data: taskFromInput(id, input),
      }),
    ),
    deleteTask: vi.fn(
      async (id: string): Promise<ActionResult<{ id: string }>> => ({
        ok: true,
        data: { id },
      }),
    ),
    ...overrides,
  };
}

function failWith(error: string) {
  return vi.fn(async () => ({ ok: false as const, error }));
}

function column(name: string) {
  return screen.getByRole("region", { name });
}

function card(title: string) {
  return screen.getByRole("article", { name: title });
}

function addForm() {
  return screen.getByRole("form", { name: "タスクを追加" });
}

function editForm(title: string) {
  return screen.getByRole("form", { name: `「${title}」を編集` });
}

describe("一覧表示", () => {
  test("未着手・進行中・完了の3列が表示される", () => {
    render(<KanbanBoard initialTasks={[]} actions={makeActions()} />);

    expect(column("未着手")).toBeDefined();
    expect(column("進行中")).toBeDefined();
    expect(column("完了")).toBeDefined();
  });

  test("各タスクがステータスに対応する列にタイトルと説明付きで表示される", () => {
    const tasks = [
      makeTask({ id: "1", title: "買い物", status: "todo" }),
      makeTask({ id: "2", title: "掃除", description: "", status: "in_progress" }),
      makeTask({ id: "3", title: "洗濯", status: "done" }),
    ];
    render(<KanbanBoard initialTasks={tasks} actions={makeActions()} />);

    expect(within(column("未着手")).getByRole("article", { name: "買い物" })).toBeDefined();
    expect(within(card("買い物")).getByText("牛乳を買う")).toBeDefined();
    expect(within(column("進行中")).getByRole("article", { name: "掃除" })).toBeDefined();
    expect(within(column("完了")).getByRole("article", { name: "洗濯" })).toBeDefined();
  });

  test("タスクが0件の列には空であることが表示される", () => {
    render(<KanbanBoard initialTasks={[]} actions={makeActions()} />);

    for (const name of ["未着手", "進行中", "完了"]) {
      expect(within(column(name)).getByText("タスクはありません")).toBeDefined();
    }
  });
});

describe("タスクの追加", () => {
  test("タイトルと説明を入力して追加すると、未着手列にすぐ表示されフォームが空に戻る", async () => {
    const user = userEvent.setup();
    const actions = makeActions();
    render(<KanbanBoard initialTasks={[]} actions={actions} />);

    await user.type(within(addForm()).getByLabelText("タイトル"), "買い物");
    await user.type(within(addForm()).getByLabelText("説明"), "牛乳を買う");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(actions.createTask).toHaveBeenCalledWith({
      title: "買い物",
      description: "牛乳を買う",
      status: "todo",
    });
    expect(within(column("未着手")).getByRole("article", { name: "買い物" })).toBeDefined();
    expect(within(addForm()).getByLabelText<HTMLInputElement>("タイトル").value).toBe("");
    expect(within(addForm()).getByLabelText<HTMLTextAreaElement>("説明").value).toBe("");
  });

  test("ステータスを選んで追加すると、選んだ列に表示される", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard initialTasks={[]} actions={makeActions()} />);

    await user.type(within(addForm()).getByLabelText("タイトル"), "洗濯");
    await user.selectOptions(within(addForm()).getByLabelText("ステータス"), "完了");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(within(column("完了")).getByRole("article", { name: "洗濯" })).toBeDefined();
  });

  test("タイトルが空白のまま追加するとエラーが表示され、アクションは呼ばれない", async () => {
    const user = userEvent.setup();
    const actions = makeActions();
    render(<KanbanBoard initialTasks={[]} actions={actions} />);

    await user.type(within(addForm()).getByLabelText("タイトル"), "   ");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(within(addForm()).getByRole("alert").textContent).toBe(
      "タイトルを入力してください",
    );
    expect(actions.createTask).not.toHaveBeenCalled();
  });

  test("追加に失敗するとエラーが表示され、一覧は変わらず入力内容も残る", async () => {
    const user = userEvent.setup();
    const actions = makeActions({ createTask: failWith("タスクの追加に失敗しました") });
    render(<KanbanBoard initialTasks={[]} actions={actions} />);

    await user.type(within(addForm()).getByLabelText("タイトル"), "買い物");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(within(addForm()).getByRole("alert").textContent).toBe(
      "タスクの追加に失敗しました",
    );
    expect(screen.queryByRole("article")).toBeNull();
    expect(within(addForm()).getByLabelText<HTMLInputElement>("タイトル").value).toBe("買い物");
  });

  test("追加の処理中は追加ボタンが押せなくなる", async () => {
    const user = userEvent.setup();
    const actions = makeActions({
      createTask: vi.fn(() => new Promise<ActionResult<Task>>(() => {})),
    });
    render(<KanbanBoard initialTasks={[]} actions={actions} />);

    await user.type(within(addForm()).getByLabelText("タイトル"), "買い物");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(
      within(addForm()).getByRole<HTMLButtonElement>("button", { name: "追加中…" }).disabled,
    ).toBe(true);
  });
});

describe("タスクの編集", () => {
  test("編集ボタンを押すと現在の内容が入った編集フォームが表示される", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={makeActions()} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "編集" }));

    const form = editForm("買い物");
    expect(within(form).getByLabelText<HTMLInputElement>("タイトル").value).toBe("買い物");
    expect(within(form).getByLabelText<HTMLTextAreaElement>("説明").value).toBe("牛乳を買う");
    expect(within(form).getByLabelText<HTMLSelectElement>("ステータス").value).toBe("todo");
  });

  test("内容を変えて保存すると、カードの表示がすぐ更新され編集フォームが閉じる", async () => {
    const user = userEvent.setup();
    const actions = makeActions();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={actions} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "編集" }));
    const form = editForm("買い物");
    await user.clear(within(form).getByLabelText("タイトル"));
    await user.type(within(form).getByLabelText("タイトル"), "まとめ買い");
    await user.click(within(form).getByRole("button", { name: "保存" }));

    expect(actions.updateTask).toHaveBeenCalledWith("task-1", {
      title: "まとめ買い",
      description: "牛乳を買う",
      status: "todo",
    });
    expect(card("まとめ買い")).toBeDefined();
    expect(screen.queryByRole("article", { name: "買い物" })).toBeNull();
    expect(screen.queryByRole("form", { name: /を編集/ })).toBeNull();
  });

  test("ステータスを変えて保存すると、タスクが別の列へ移動する", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={makeActions()} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "編集" }));
    const form = editForm("買い物");
    await user.selectOptions(within(form).getByLabelText("ステータス"), "進行中");
    await user.click(within(form).getByRole("button", { name: "保存" }));

    expect(within(column("進行中")).getByRole("article", { name: "買い物" })).toBeDefined();
    expect(within(column("未着手")).queryByRole("article", { name: "買い物" })).toBeNull();
  });

  test("編集中にキャンセルすると、変更は破棄され元の表示に戻る", async () => {
    const user = userEvent.setup();
    const actions = makeActions();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={actions} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "編集" }));
    const form = editForm("買い物");
    await user.type(within(form).getByLabelText("タイトル"), "（変更）");
    await user.click(within(form).getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByRole("form", { name: /を編集/ })).toBeNull();
    expect(within(card("買い物")).getByRole("button", { name: "編集" })).toBeDefined();
    expect(actions.updateTask).not.toHaveBeenCalled();
  });

  test("キャンセル後にもう一度編集を開くと、保存済みの内容が表示される", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={makeActions()} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "編集" }));
    await user.type(within(editForm("買い物")).getByLabelText("タイトル"), "（変更）");
    await user.click(within(editForm("買い物")).getByRole("button", { name: "キャンセル" }));
    await user.click(within(card("買い物")).getByRole("button", { name: "編集" }));

    expect(
      within(editForm("買い物")).getByLabelText<HTMLInputElement>("タイトル").value,
    ).toBe("買い物");
  });

  test("タイトルを空にして保存するとエラーが表示され、アクションは呼ばれない", async () => {
    const user = userEvent.setup();
    const actions = makeActions();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={actions} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "編集" }));
    const form = editForm("買い物");
    await user.clear(within(form).getByLabelText("タイトル"));
    await user.click(within(form).getByRole("button", { name: "保存" }));

    expect(within(form).getByRole("alert").textContent).toBe("タイトルを入力してください");
    expect(actions.updateTask).not.toHaveBeenCalled();
  });

  test("保存に失敗するとエラーが表示され、編集フォームは開いたままになる", async () => {
    const user = userEvent.setup();
    const actions = makeActions({ updateTask: failWith("タスクの更新に失敗しました") });
    render(<KanbanBoard initialTasks={[makeTask()]} actions={actions} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "編集" }));
    await user.click(within(editForm("買い物")).getByRole("button", { name: "保存" }));

    expect(within(editForm("買い物")).getByRole("alert").textContent).toBe(
      "タスクの更新に失敗しました",
    );
  });
});

describe("タスクの削除", () => {
  test("削除ボタンを押すと、タスク名を含む確認ダイアログが表示される", async () => {
    const user = userEvent.setup();
    const actions = makeActions();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={actions} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "削除" }));

    const dialog = screen.getByRole("alertdialog", { name: "タスクの削除" });
    expect(within(dialog).getByText("「買い物」を削除しますか？")).toBeDefined();
    expect(actions.deleteTask).not.toHaveBeenCalled();
  });

  test("確認ダイアログでキャンセルすると、ダイアログが閉じてタスクは残る", async () => {
    const user = userEvent.setup();
    const actions = makeActions();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={actions} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "削除" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "キャンセル" }),
    );

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(card("買い物")).toBeDefined();
    expect(actions.deleteTask).not.toHaveBeenCalled();
  });

  test("確認ダイアログで Esc キーを押すと、ダイアログが閉じてタスクは残る", async () => {
    const user = userEvent.setup();
    const actions = makeActions();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={actions} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "削除" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(card("買い物")).toBeDefined();
    expect(actions.deleteTask).not.toHaveBeenCalled();
  });

  test("確認ダイアログで削除を確定すると、タスクが一覧からすぐ消える", async () => {
    const user = userEvent.setup();
    const actions = makeActions();
    render(<KanbanBoard initialTasks={[makeTask()]} actions={actions} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "削除" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "削除する" }),
    );

    expect(actions.deleteTask).toHaveBeenCalledWith("task-1");
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.queryByRole("article", { name: "買い物" })).toBeNull();
    expect(within(column("未着手")).getByText("タスクはありません")).toBeDefined();
  });

  test("削除に失敗するとエラーが表示され、タスクは一覧に残る", async () => {
    const user = userEvent.setup();
    const actions = makeActions({ deleteTask: failWith("タスクの削除に失敗しました") });
    render(<KanbanBoard initialTasks={[makeTask()]} actions={actions} />);

    await user.click(within(card("買い物")).getByRole("button", { name: "削除" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "削除する" }),
    );

    expect(within(card("買い物")).getByRole("alert").textContent).toBe(
      "タスクの削除に失敗しました",
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
