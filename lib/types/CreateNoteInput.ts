import type { TaskDTO } from "./TaskDTO";

export type CreateNoteInput = {
  title: string;
  description: string;
  tasks?: Omit<TaskDTO, "id">[];
};
