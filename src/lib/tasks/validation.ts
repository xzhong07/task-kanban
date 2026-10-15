import { TASK_STATUSES, type TaskInput, type TaskStatus, type ValidTaskInput } from "./types";

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 1000;

export type TaskInputErrors = Partial<Record<keyof TaskInput, string>>;

export type ValidationResult =
  | { ok: true; data: ValidTaskInput }
  | { ok: false; errors: TaskInputErrors };

// DB の char_length と同じくコードポイント単位で数える（絵文字などのサロゲートペア対策）
function countChars(value: string): number {
  return Array.from(value).length;
}

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.some((status) => status.value === value);
}

export function validateTaskInput(input: TaskInput): ValidationResult {
  const errors: TaskInputErrors = {};
  const title = input.title.trim();

  if (title.length === 0) {
    errors.title = "タイトルを入力してください";
  } else if (countChars(title) > TITLE_MAX_LENGTH) {
    errors.title = `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`;
  }

  if (countChars(input.description) > DESCRIPTION_MAX_LENGTH) {
    errors.description = `説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`;
  }

  if (!isTaskStatus(input.status)) {
    errors.status = "ステータスが不正です";
    return { ok: false, errors };
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { title, description: input.description, status: input.status },
  };
}
