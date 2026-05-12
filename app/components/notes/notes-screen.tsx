"use client";

import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import type { NoteDTO } from "@/lib/types/NoteDTO";
import { Button } from "../ui/button";
import { Dropdown, type DropdownOption } from "../ui/dropdown";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { NoteCard } from "./note-card";
import { NoteFormModal, type NoteFormValues } from "./note-form-modal";

type FilterKey = "all" | "with-tasks" | "all-done" | "unfinished";

const FILTER_OPTIONS: DropdownOption<FilterKey>[] = [
  { value: "all", label: "All notes" },
  { value: "with-tasks", label: "With tasks" },
  { value: "all-done", label: "All tasks done" },
  { value: "unfinished", label: "Has unfinished tasks" },
];

function matchesFilter(note: NoteDTO, filter: FilterKey): boolean {
  const total = note.tasks?.length ?? 0;
  const done = note.tasks?.filter((t) => t.isDone).length ?? 0;
  switch (filter) {
    case "all":
      return true;
    case "with-tasks":
      return total > 0;
    case "all-done":
      return total > 0 && done === total;
    case "unfinished":
      return total > 0 && done < total;
  }
}

function matchesQuery(note: NoteDTO, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    note.title.toLowerCase().includes(needle) ||
    note.description.toLowerCase().includes(needle)
  );
}

type Mode = "active" | "archived";

type Props = {
  mode: Mode;
  initialNotes: NoteDTO[];
};

const COPY: Record<
  Mode,
  {
    heading: string;
    countNoun: (n: number) => string;
    emptyTitle: string;
    searchPlaceholder: string;
  }
> = {
  active: {
    heading: "Your notes",
    countNoun: (n) => (n === 1 ? "note" : "notes"),
    emptyTitle: "No notes yet.",
    searchPlaceholder: "Search title or description…",
  },
  archived: {
    heading: "Archive",
    countNoun: (n) => (n === 1 ? "archived note" : "archived notes"),
    emptyTitle: "No archived notes.",
    searchPlaceholder: "Search archived notes…",
  },
};

export function NotesScreen({ mode, initialNotes }: Props) {
  const copy = COPY[mode];
  const [notes, setNotes] = useState<NoteDTO[]>(initialNotes);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NoteDTO | null>(null);
  const [deleting, setDeleting] = useState<NoteDTO | null>(null);

  const visibleNotes = useMemo(
    () =>
      notes.filter(
        (n) => matchesFilter(n, filter) && matchesQuery(n, query),
      ),
    [notes, filter, query],
  );

  const filterActive = filter !== "all" || query.trim().length > 0;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (note: NoteDTO) => {
    setEditing(note);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const clearFilters = () => {
    setQuery("");
    setFilter("all");
  };

  const handleSave = async (values: NoteFormValues) => {
    try {
      if (editing) {
        const res = await fetch(`/api/notes/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { note }: { note: NoteDTO } = await res.json();
        setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      } else {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { note }: { note: NoteDTO } = await res.json();
        setNotes((prev) => [...prev, note]);
      }
      setError(null);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    }
  };

  const flipArchive = async (note: NoteDTO, toArchived: boolean) => {
    const snapshot = notes;
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: toArchived }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      setNotes(snapshot);
      setError(
        err instanceof Error
          ? err.message
          : toArchived
            ? "Failed to archive note"
            : "Failed to restore note",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const id = deleting.id;
    const snapshot = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setDeleting(null);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      setNotes(snapshot);
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {copy.heading}
          </h2>
          <p className="text-sm text-muted">
            {filterActive
              ? `${visibleNotes.length} of ${notes.length} ${copy.countNoun(notes.length)}`
              : `${notes.length} ${copy.countNoun(notes.length)}`}
          </p>
        </div>
        {mode === "active" && (
          <Button onClick={openCreate}>
            <PlusIcon className="size-4" /> New note
          </Button>
        )}
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label="Search notes"
              className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
            />
          </div>
          <Dropdown<FilterKey>
            value={filter}
            onChange={setFilter}
            options={FILTER_OPTIONS}
            className="sm:w-56"
          />
        </div>
      )}

      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">{copy.emptyTitle}</p>
          {mode === "active" && (
            <div className="mt-4 flex justify-center">
              <Button onClick={openCreate}>
                <PlusIcon className="size-4" /> Create your first note
              </Button>
            </div>
          )}
        </div>
      ) : visibleNotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">No notes match your search.</p>
          <div className="mt-4 flex justify-center">
            <Button variant="outlined" onClick={clearFilters}>
              Clear search &amp; filter
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleNotes.map((note) =>
            mode === "active" ? (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => openEdit(note)}
                onArchive={() => flipArchive(note, true)}
                onDelete={() => setDeleting(note)}
              />
            ) : (
              <NoteCard
                key={note.id}
                note={note}
                onRestore={() => flipArchive(note, false)}
                onDelete={() => setDeleting(note)}
              />
            ),
          )}
        </div>
      )}

      {mode === "active" && (
        <NoteFormModal
          open={formOpen}
          note={editing}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}
      <DeleteConfirmModal
        target={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
