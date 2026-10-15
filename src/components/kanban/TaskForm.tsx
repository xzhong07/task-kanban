"use client";

import { useId, useState, type FormEvent } from "react";
import { TASK_STATUSES, type ActionResult, type TaskInput } from "@/lib/tasks/types";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  validateTaskInput,
} from "@/lib/tasks/validation";

type TaskFormProps = {
  label: string;
  initialValues: TaskInput;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (input: TaskInput) => Promise<ActionResult<unknown>>;
  onCancel?: () => void;
  resetOnSuccess?: boolean;
};

const inputClassName =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

export function TaskForm({
  label,
  initialValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  onCancel,
  resetOnSuccess = false,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskInput>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const statusId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateTaskInput(values);
    if (!validation.ok) {
      setError(Object.values(validation.errors).join(" "));
      return;
    }

    setError(null);
    setIsPending(true);
    const result = await onSubmit(values);
    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (resetOnSuccess) {
      setValues(initialValues);
    }
  }

  return (
    <form aria-label={label} onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={titleId} className="text-sm font-medium">
          タイトル
        </label>
        <input
          id={titleId}
          type="text"
          maxLength={TITLE_MAX_LENGTH}
          value={values.title}
          onChange={(event) => setValues({ ...values, title: event.target.value })}
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={descriptionId} className="text-sm font-medium">
          説明
        </label>
        <textarea
          id={descriptionId}
          rows={2}
          maxLength={DESCRIPTION_MAX_LENGTH}
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={statusId} className="text-sm font-medium">
          ステータス
        </label>
        <select
          id={statusId}
          value={values.status}
          onChange={(event) => setValues({ ...values, status: event.target.value })}
          className={inputClassName}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
