import { describe, expect, test } from "vitest";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  validateTaskInput,
} from "@/lib/tasks/validation";

const valid = { title: "買い物", description: "牛乳を買う", status: "todo" };

describe("validateTaskInput", () => {
  test("正しい入力はタイトルの前後の空白を除いて有効になる", () => {
    const result = validateTaskInput({ ...valid, title: "  買い物  " });

    expect(result).toEqual({
      ok: true,
      data: { title: "買い物", description: "牛乳を買う", status: "todo" },
    });
  });

  test.each(["todo", "in_progress", "done"])(
    "ステータスが %s の場合は有効になる",
    (status) => {
      expect(validateTaskInput({ ...valid, status }).ok).toBe(true);
    },
  );

  test.each([
    ["空文字", ""],
    ["空白のみ", "   "],
  ])("タイトルが%sの場合はタイトルのエラーになる", (_, title) => {
    const result = validateTaskInput({ ...valid, title });

    expect(result).toEqual({
      ok: false,
      errors: { title: "タイトルを入力してください" },
    });
  });

  test("タイトルが上限ちょうどの文字数の場合は有効になる", () => {
    const title = "あ".repeat(TITLE_MAX_LENGTH);

    expect(validateTaskInput({ ...valid, title }).ok).toBe(true);
  });

  test("タイトルが上限を1文字超える場合はタイトルのエラーになる", () => {
    const title = "あ".repeat(TITLE_MAX_LENGTH + 1);

    expect(validateTaskInput({ ...valid, title })).toEqual({
      ok: false,
      errors: { title: `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください` },
    });
  });

  test("説明が空の場合は有効になる", () => {
    expect(validateTaskInput({ ...valid, description: "" }).ok).toBe(true);
  });

  test("説明が上限ちょうどの文字数の場合は有効になる", () => {
    const description = "あ".repeat(DESCRIPTION_MAX_LENGTH);

    expect(validateTaskInput({ ...valid, description }).ok).toBe(true);
  });

  test("説明が上限を1文字超える場合は説明のエラーになる", () => {
    const description = "あ".repeat(DESCRIPTION_MAX_LENGTH + 1);

    expect(validateTaskInput({ ...valid, description })).toEqual({
      ok: false,
      errors: {
        description: `説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`,
      },
    });
  });

  test("ステータスが不正な値の場合はステータスのエラーになる", () => {
    expect(validateTaskInput({ ...valid, status: "archived" })).toEqual({
      ok: false,
      errors: { status: "ステータスが不正です" },
    });
  });

  test("複数の項目が不正な場合はすべてのエラーを返す", () => {
    const result = validateTaskInput({ title: "", description: "", status: "x" });

    expect(result).toEqual({
      ok: false,
      errors: {
        title: "タイトルを入力してください",
        status: "ステータスが不正です",
      },
    });
  });
});

describe("validateTaskInput の文字数の数え方", () => {
  test("絵文字は1文字として数え、上限ちょうどなら有効になる", () => {
    const title = "😀".repeat(TITLE_MAX_LENGTH);

    expect(validateTaskInput({ ...valid, title }).ok).toBe(true);
  });
});
