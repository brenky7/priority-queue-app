import type { Task, CompletedTask } from "../types/Task";

export interface QueueUpdatePayload {
  activeTasks: Task[];
  completedTasks: CompletedTask[];
  currentlyProcessingTask: Task | null;
}

export interface TaskProgressPayload {
  taskId: string;
  progress: number;
}

export interface TaskCompletedPayload {
  task: CompletedTask;
}
