import { randomUUID } from "node:crypto";
import type { CreateNoteInput } from "./types/CreateNoteInput";
import type { NoteDTO } from "./types/NoteDTO";
import type { TaskDTO } from "./types/TaskDTO";
import type { UpdateNoteInput } from "./types/UpdateNoteInput";

const globalForStore = globalThis as unknown as {
  __notesStore?: Map<string, NoteDTO>;
};

function seed(): Map<string, NoteDTO> {
  const map = new Map<string, NoteDTO>();
  const sample: NoteDTO = {
    id: randomUUID(),
    title: "Welcome",
    description: "This is a mock notes API. Edit or delete me.",
    isArchived: false,
    tasks: [
      { id: randomUUID(), description: "Try creating a note", isDone: false },
      { id: randomUUID(), description: "Toggle a task", isDone: false },
    ],
  };
  map.set(sample.id, sample);
  return map;
}

const store = globalForStore.__notesStore ?? seed();
if (process.env.NODE_ENV !== "production") globalForStore.__notesStore = store;

export const notesStore = {
  list(): NoteDTO[] {
    return Array.from(store.values());
  },
  get(id: string): NoteDTO | undefined {
    return store.get(id);
  },
  create(input: CreateNoteInput): NoteDTO {
    const note: NoteDTO = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      isArchived: false,
      tasks: input.tasks?.map<TaskDTO>((t) => ({ ...t, id: randomUUID() })),
    };
    store.set(note.id, note);
    return note;
  },
  update(id: string, input: UpdateNoteInput): NoteDTO | undefined {
    const existing = store.get(id);
    if (!existing) return undefined;
    const updated: NoteDTO = { ...existing, ...input };
    store.set(id, updated);
    return updated;
  },
  delete(id: string): boolean {
    return store.delete(id);
  },
};
