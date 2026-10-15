// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { createTask, deleteTask, updateTask } from "@/app/actions";
import { getTasks } from "@/lib/tasks/queries";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

type QueryResult = { data: unknown; error: { message: string } | null };
type Call = { method: string; args: unknown[] };

// Supabase のクエリビルダーを模したフェイク。呼び出しを記録し、最後に result を返す
function mockSupabase(result: QueryResult): Call[] {
  const calls: Call[] = [];
  const builder: object = new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === "then") {
          return (resolve: (value: QueryResult) => void) => resolve(result);
        }
        return (...args: unknown[]) => {
          calls.push({ method: String(prop), args });
          return builder;
        };
      },
    },
  );
  vi.mocked(createClient).mockResolvedValue({
    from: (table: string) => {
      calls.push({ method: "from", args: [table] });
      return builder;
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
  return calls;
}

const row = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "買い物",
  description: "牛乳を買う",
  status: "todo",
  created_at: "2026-10-15T00:00:00Z",
  updated_at: "2026-10-15T00:00:00Z",
};
const task = {
  id: row.id,
  title: "買い物",
  description: "牛乳を買う",
  status: "todo",
  createdAt: "2026-10-15T00:00:00Z",
};
const input = { title: "  買い物  ", description: "牛乳を買う", status: "todo" };
const dbError = { message: "db error" };

beforeEach(() => {
  vi.mocked(createClient).mockReset();
});

describe("createTask", () => {
  test("有効な入力の場合は前後の空白を除いて tasks に登録し、作成したタスクを返す", async () => {
    const calls = mockSupabase({ data: row, error: null });

    const result = await createTask(input);

    expect(result).toEqual({ ok: true, data: task });
    expect(calls).toContainEqual({ method: "from", args: ["tasks"] });
    expect(calls).toContainEqual({
      method: "insert",
      args: [{ title: "買い物", description: "牛乳を買う", status: "todo" }],
    });
  });

  test("入力が不正な場合は DB に接続せずにエラーを返す", async () => {
    const result = await createTask({ ...input, title: "" });

    expect(result).toEqual({ ok: false, error: "タイトルを入力してください" });
    expect(createClient).not.toHaveBeenCalled();
  });

  test("DB がエラーを返した場合は追加失敗のエラーを返す", async () => {
    mockSupabase({ data: null, error: dbError });

    const result = await createTask(input);

    expect(result).toEqual({ ok: false, error: "タスクの追加に失敗しました" });
  });
});

describe("updateTask", () => {
  test("有効な入力の場合は指定した ID のタスクを更新し、更新後のタスクを返す", async () => {
    const updatedRow = { ...row, title: "掃除", status: "done" };
    const calls = mockSupabase({ data: updatedRow, error: null });

    const result = await updateTask(row.id, { ...input, title: "掃除", status: "done" });

    expect(result).toEqual({
      ok: true,
      data: { ...task, title: "掃除", status: "done" },
    });
    expect(calls).toContainEqual({
      method: "update",
      args: [{ title: "掃除", description: "牛乳を買う", status: "done" }],
    });
    expect(calls).toContainEqual({ method: "eq", args: ["id", row.id] });
  });

  test("入力が不正な場合は DB に接続せずにエラーを返す", async () => {
    const result = await updateTask(row.id, { ...input, status: "archived" });

    expect(result).toEqual({ ok: false, error: "ステータスが不正です" });
    expect(createClient).not.toHaveBeenCalled();
  });

  test("DB がエラーを返した場合は更新失敗のエラーを返す", async () => {
    mockSupabase({ data: null, error: dbError });

    const result = await updateTask(row.id, input);

    expect(result).toEqual({ ok: false, error: "タスクの更新に失敗しました" });
  });
});

describe("deleteTask", () => {
  test("指定した ID のタスクを削除し、削除した ID を返す", async () => {
    const calls = mockSupabase({ data: [{ id: row.id }], error: null });

    const result = await deleteTask(row.id);

    expect(result).toEqual({ ok: true, data: { id: row.id } });
    expect(calls).toContainEqual({ method: "delete", args: [] });
    expect(calls).toContainEqual({ method: "eq", args: ["id", row.id] });
  });

  test("該当するタスクが存在しない場合は見つからないエラーを返す", async () => {
    mockSupabase({ data: [], error: null });

    const result = await deleteTask(row.id);

    expect(result).toEqual({ ok: false, error: "タスクが見つかりません" });
  });

  test("DB がエラーを返した場合は削除失敗のエラーを返す", async () => {
    mockSupabase({ data: null, error: dbError });

    const result = await deleteTask(row.id);

    expect(result).toEqual({ ok: false, error: "タスクの削除に失敗しました" });
  });
});

describe("getTasks", () => {
  test("tasks を作成日時の昇順で取得し、画面用の形に変換して返す", async () => {
    const calls = mockSupabase({ data: [row], error: null });

    const result = await getTasks();

    expect(result).toEqual([task]);
    expect(calls).toContainEqual({
      method: "order",
      args: ["created_at", { ascending: true }],
    });
  });

  test("タスクが0件の場合は空配列を返す", async () => {
    mockSupabase({ data: [], error: null });

    expect(await getTasks()).toEqual([]);
  });

  test("DB がエラーを返した場合は例外を投げる", async () => {
    mockSupabase({ data: null, error: dbError });

    await expect(getTasks()).rejects.toThrow("タスクの取得に失敗しました");
  });
});
