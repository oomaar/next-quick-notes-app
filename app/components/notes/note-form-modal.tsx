"use client";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useId } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { NoteDTO } from "@/lib/types/NoteDTO";
import type { TaskDTO } from "@/lib/types/TaskDTO";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { TextArea } from "../ui/text-area";

export type NoteFormValues = {
  title: string;
  description: string;
  tasks: TaskDTO[];
};

type Props = {
  open: boolean;
  note: NoteDTO | null;
  onClose: () => void;
  onSave: (values: NoteFormValues) => Promise<void> | void;
};

const EMPTY: NoteFormValues = { title: "", description: "", tasks: [] };

export function NoteFormModal({ open, note, onClose, onSave }: Props) {
  const formId = useId();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({ defaultValues: EMPTY });

  const { fields, append, remove } = useFieldArray<NoteFormValues, "tasks", "fieldId">({
    control,
    name: "tasks",
    keyName: "fieldId",
  });

  useEffect(() => {
    if (!open) return;
    reset(
      note
        ? {
            title: note.title,
            description: note.description,
            tasks: note.tasks ?? [],
          }
        : EMPTY,
    );
  }, [open, note, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={note ? "Edit note" : "New note"}
      footer={
        <>
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {note ? "Save" : "Create"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit(onSave)}
        className="flex flex-col gap-4"
      >
        <Input
          label="Title"
          placeholder="Note title"
          error={errors.title?.message}
          {...register("title", { required: "Title is required" })}
        />
        <TextArea
          label="Description"
          placeholder="Describe the note…"
          error={errors.description?.message}
          {...register("description", { required: "Description is required" })}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Tasks</span>
            <Button
              size="sm"
              variant="outlined"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  description: "",
                  isDone: false,
                })
              }
            >
              <PlusIcon className="size-3.5" /> Add task
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-xs text-muted">No tasks yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <li key={field.fieldId} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label="Mark task done"
                    {...register(`tasks.${index}.isDone`)}
                    className="size-4 rounded border-border accent-emerald-500"
                  />
                  <Input
                    placeholder="Task description"
                    className="flex-1"
                    error={
                      errors.tasks?.[index]?.description ? "Required" : undefined
                    }
                    {...register(`tasks.${index}.description`, {
                      required: true,
                    })}
                  />
                  <input type="hidden" {...register(`tasks.${index}.id`)} />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Remove task"
                    className="rounded-md p-1.5 text-muted hover:bg-foreground/10 hover:text-red-500"
                  >
                    <XMarkIcon className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </Modal>
  );
}
