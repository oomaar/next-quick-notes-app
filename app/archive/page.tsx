import type { Metadata } from "next";
import { notesStore } from "@/lib/notes-store";
import { NotesScreen } from "../components/notes/notes-screen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Archive",
};

export default function ArchivePage() {
  const notes = notesStore.list().filter((n) => n.isArchived);
  return <NotesScreen mode="archived" initialNotes={notes} />;
}
