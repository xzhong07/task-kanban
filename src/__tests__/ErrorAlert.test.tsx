import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ErrorAlert } from "@/components/kanban/ErrorAlert";

afterEach(() => {
  cleanup();
});

describe("ErrorAlert", () => {
  test("メッセージを渡すと、そのメッセージだけを含む alert が表示される", () => {
    render(<ErrorAlert message="タスクの追加に失敗しました" />);

    expect(screen.getByRole("alert").textContent).toBe("タスクの追加に失敗しました");
  });

  test("複数行にわたる長いメッセージもそのまま表示される", () => {
    const message = "タイトルを入力してください 説明は1000文字以内で入力してください";
    render(<ErrorAlert message={message} />);

    expect(screen.getByRole("alert").textContent).toBe(message);
  });
});
