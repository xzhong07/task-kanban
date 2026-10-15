"use client";

import { useId, useState, type FormEvent } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
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
    <form aria-label={label} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={titleId}>タイトル</Label>
        <Input
          id={titleId}
          type="text"
          maxLength={TITLE_MAX_LENGTH}
          placeholder="例: 企画書を作成する"
          value={values.title}
          onChange={(event) => setValues({ ...values, title: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={descriptionId}>説明</Label>
        <Textarea
          id={descriptionId}
          rows={2}
          maxLength={DESCRIPTION_MAX_LENGTH}
          placeholder="詳細やメモ（任意）"
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={statusId}>ステータス</Label>
        <NativeSelect
          id={statusId}
          className="w-full"
          value={values.status}
          onChange={(event) => setValues({ ...values, status: event.target.value })}
        >
          {TASK_STATUSES.map((status) => (
            <NativeSelectOption key={status.value} value={status.value}>
              {status.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      {error && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
