import type { TaskDTO } from "./TaskDTO";

export type UpdateNoteInput = Partial<{
  title: string;
  description: string;
  tasks: TaskDTO[];
  isArchived: boolean;
}>;
