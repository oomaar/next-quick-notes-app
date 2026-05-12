import { notesStore } from "@/lib/notes-store";
import type { CreateNoteInput } from "@/lib/types/CreateNoteInput";

export async function GET() {
  return Response.json({ notes: notesStore.list() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateNoteInput>;

  if (typeof body.title !== "string" || typeof body.description !== "string") {
    return Response.json(
      { error: "title and description are required strings" },
      { status: 400 },
    );
  }

  const note = notesStore.create({
    title: body.title,
    description: body.description,
    tasks: body.tasks,
  });

  return Response.json({ note }, { status: 201 });
}
