import type { Task, CompletedTask } from "./task";

export type QueueUpdatePayload = {
  activeTasks: Task[];
  completedTasks: CompletedTask[];
  currentlyProcessingTask: Task | null;
};

export type TaskProgressPayload = {
  taskId: string;
  progress: number;
};

export type TaskCompletedPayload = {
  task: CompletedTask;
};
