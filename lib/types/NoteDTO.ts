import type { TaskDTO } from "./TaskDTO";

export type NoteDTO = {
  id: string;
  title: string;
  description: string;
  isArchived: boolean;
  tasks?: TaskDTO[];
};
