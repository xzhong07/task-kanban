import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCardActions } from "@/components/kanban/TaskCardActions";

afterEach(() => {
  cleanup();
});

describe("TaskCardActions", () => {
  test("編集ボタンを押すと onEdit が呼ばれ、onDelete は呼ばれない", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TaskCardActions isDeleting={false} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "編集" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("削除ボタンを押すと onDelete が呼ばれ、onEdit は呼ばれない", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TaskCardActions isDeleting={false} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
  });

  test("削除中は削除ボタンの名前が「削除中…」になり、両方のボタンが押せない", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TaskCardActions isDeleting onEdit={onEdit} onDelete={onDelete} />);

    const editButton = screen.getByRole<HTMLButtonElement>("button", { name: "編集" });
    const deleteButton = screen.getByRole<HTMLButtonElement>("button", { name: "削除中…" });
    expect(editButton.disabled).toBe(true);
    expect(deleteButton.disabled).toBe(true);

    await user.click(editButton);
    await user.click(deleteButton);
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
