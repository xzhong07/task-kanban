import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewTaskPanel } from "@/components/kanban/NewTaskPanel";
import type { ActionResult } from "@/lib/tasks/types";

afterEach(() => {
  cleanup();
});

function addForm() {
  return screen.getByRole("form", { name: "タスクを追加" });
}

describe("NewTaskPanel", () => {
  test("見出しと、初期値が空・ステータスが未着手の追加フォームが表示される", () => {
    render(<NewTaskPanel onCreate={vi.fn()} />);

    expect(screen.getByText("新しいタスク")).toBeDefined();
    expect(within(addForm()).getByLabelText<HTMLInputElement>("タイトル").value).toBe("");
    expect(within(addForm()).getByLabelText<HTMLTextAreaElement>("説明").value).toBe("");
    expect(within(addForm()).getByLabelText<HTMLSelectElement>("ステータス").value).toBe("todo");
  });

  test("入力して追加すると onCreate が入力値で呼ばれ、成功後はフォームが空に戻る", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn(
      async (): Promise<ActionResult<unknown>> => ({ ok: true, data: null }),
    );
    render(<NewTaskPanel onCreate={onCreate} />);

    await user.type(within(addForm()).getByLabelText("タイトル"), "買い物");
    await user.type(within(addForm()).getByLabelText("説明"), "牛乳を買う");
    await user.selectOptions(within(addForm()).getByLabelText("ステータス"), "進行中");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(onCreate).toHaveBeenCalledWith({
      title: "買い物",
      description: "牛乳を買う",
      status: "in_progress",
    });
    expect(within(addForm()).getByLabelText<HTMLInputElement>("タイトル").value).toBe("");
    expect(within(addForm()).getByLabelText<HTMLSelectElement>("ステータス").value).toBe("todo");
  });

  test("追加に失敗するとエラーが表示され、入力内容は残る", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn(
      async (): Promise<ActionResult<unknown>> => ({
        ok: false,
        error: "タスクの追加に失敗しました",
      }),
    );
    render(<NewTaskPanel onCreate={onCreate} />);

    await user.type(within(addForm()).getByLabelText("タイトル"), "買い物");
    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(within(addForm()).getByRole("alert").textContent).toBe("タスクの追加に失敗しました");
    expect(within(addForm()).getByLabelText<HTMLInputElement>("タイトル").value).toBe("買い物");
  });

  test("タイトルが空のまま追加するとエラーが表示され、onCreate は呼ばれない", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<NewTaskPanel onCreate={onCreate} />);

    await user.click(within(addForm()).getByRole("button", { name: "追加" }));

    expect(within(addForm()).getByRole("alert").textContent).toBe("タイトルを入力してください");
    expect(onCreate).not.toHaveBeenCalled();
  });
});
