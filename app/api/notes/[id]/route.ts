import type { NextRequest } from "next/server";
import { notesStore } from "@/lib/notes-store";
import type { UpdateNoteInput } from "@/lib/types/UpdateNoteInput";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/notes/[id]">,
) {
  const { id } = await ctx.params;
  const note = notesStore.get(id);
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ note });
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/notes/[id]">,
) {
  const { id } = await ctx.params;
  const body = (await req.json()) as UpdateNoteInput;
  const updated = notesStore.update(id, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ note: updated });
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/notes/[id]">,
) {
  return PATCH(req, ctx);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/notes/[id]">,
) {
  const { id } = await ctx.params;
  const ok = notesStore.delete(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
