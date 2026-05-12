"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import type { NoteDTO } from "@/lib/types/NoteDTO";
import { Button } from "../ui/button";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { NoteCard } from "./note-card";
import { NoteFormModal, type NoteFormValues } from "./note-form-modal";

type Props = {
  initialNotes: NoteDTO[];
};

export function NotesHome({ initialNotes }: Props) {
  const [notes, setNotes] = useState<NoteDTO[]>(initialNotes);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NoteDTO | null>(null);
  const [deleting, setDeleting] = useState<NoteDTO | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (note: NoteDTO) => {
    setEditing(note);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

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
          <h2 className="text-2xl font-semibold tracking-tight">Your notes</h2>
          <p className="text-sm text-muted">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" /> New note
        </Button>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">No notes yet.</p>
          <div className="mt-4 flex justify-center">
            <Button onClick={openCreate}>
              <PlusIcon className="size-4" /> Create your first note
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => openEdit(note)}
              onDelete={() => setDeleting(note)}
            />
          ))}
        </div>
      )}

      <NoteFormModal
        open={formOpen}
        note={editing}
        onClose={closeForm}
        onSave={handleSave}
      />
      <DeleteConfirmModal
        target={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
