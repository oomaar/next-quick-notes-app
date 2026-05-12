import { notesStore } from "@/lib/notes-store";
import { NotesScreen } from "./components/notes/notes-screen";

export const dynamic = "force-dynamic";

export default function Home() {
  const notes = notesStore.list().filter((n) => !n.isArchived);
  return <NotesScreen mode="active" initialNotes={notes} />;
}
