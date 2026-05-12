import { notesStore } from "@/lib/notes-store";
import { NotesHome } from "./components/notes/notes-home";

export const dynamic = "force-dynamic";

export default function Home() {
  const notes = notesStore.list();
  return <NotesHome initialNotes={notes} />;
}
