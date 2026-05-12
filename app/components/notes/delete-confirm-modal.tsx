"use client";

import type { NoteDTO } from "@/lib/types/NoteDTO";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

type Props = {
  target: NoteDTO | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmModal({ target, onCancel, onConfirm }: Props) {
  return (
    <Modal
      open={!!target}
      onClose={onCancel}
      title="Delete note?"
      footer={
        <>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">
        This will permanently remove{" "}
        <span className="font-medium text-foreground">
          “{target?.title ?? ""}”
        </span>
        . This can&apos;t be undone.
      </p>
    </Modal>
  );
}
