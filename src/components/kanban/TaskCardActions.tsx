"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardAction } from "@/components/ui/card";

type TaskCardActionsProps = {
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function TaskCardActions({ isDeleting, onEdit, onDelete }: TaskCardActionsProps) {
  return (
    <CardAction className="flex gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="編集"
        title="編集"
        onClick={onEdit}
        disabled={isDeleting}
        className="text-muted-foreground"
      >
        <Pencil aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={isDeleting ? "削除中…" : "削除"}
        title="削除"
        onClick={onDelete}
        disabled={isDeleting}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        {isDeleting ? (
          <Loader2 aria-hidden="true" className="animate-spin" />
        ) : (
          <Trash2 aria-hidden="true" />
        )}
      </Button>
    </CardAction>
  );
}
