"use client";

import {
  ArchiveBoxArrowDownIcon,
  ArrowUturnLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { NoteDTO } from "@/lib/types/NoteDTO";
import { Button } from "../ui/button";

type Props = {
  note: NoteDTO;
  onEdit?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
};

export function NoteCard({
  note,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: Props) {
  const total = note.tasks?.length ?? 0;
  const done = note.tasks?.filter((t) => t.isDone).length ?? 0;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md">
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{note.title}</h3>
        {total > 0 && (
          <span className="shrink-0 rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted">
            {done}/{total}
          </span>
        )}
      </header>
      <p className="mt-2 line-clamp-3 text-sm text-muted">{note.description}</p>
      {total > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {onEdit && (
          <Button size="sm" variant="outlined" onClick={onEdit}>
            <PencilSquareIcon className="size-3.5" /> Edit
          </Button>
        )}
        {onArchive && (
          <Button size="sm" variant="warning" onClick={onArchive}>
            <ArchiveBoxArrowDownIcon className="size-3.5" /> Archive
          </Button>
        )}
        {onRestore && (
          <Button size="sm" variant="success" onClick={onRestore}>
            <ArrowUturnLeftIcon className="size-3.5" /> Restore
          </Button>
        )}
        {onDelete && (
          <Button size="sm" variant="danger" onClick={onDelete}>
            <TrashIcon className="size-3.5" /> Delete
          </Button>
        )}
      </div>
    </article>
  );
}
