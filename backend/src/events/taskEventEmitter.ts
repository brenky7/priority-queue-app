import { EventEmitter } from "events";
import { Task } from "../models/task.js";
import type {
  QueueUpdatePayload,
  TaskProgressPayload,
  TaskCompletedPayload,
} from "../models/taskEventTypes.js";

export enum TaskEvents {
  QUEUE_UPDATE = "queue_update",
  TASK_PROGRESS = "task_progress",
  TASK_COMPLETED = "task_completed",
}

class TaskEventEmitter extends EventEmitter {
  emitQueueUpdate(
    activeTasks: Task[],
    completedTasks: Task[],
    currentlyProcessingTask: Task | null
  ): void {
    this.emit(TaskEvents.QUEUE_UPDATE, {
      activeTasks,
      completedTasks,
      currentlyProcessingTask,
    } as QueueUpdatePayload);
  }

  emitTaskProgress(taskId: string, progress: number): void {
    this.emit(TaskEvents.TASK_PROGRESS, { taskId, progress });
  }

  emitTaskCompleted(task: Task): void {
    this.emit(TaskEvents.TASK_COMPLETED, { task });
  }

  onQueueUpdate(listener: (payload: QueueUpdatePayload) => void): this {
    return this.on(TaskEvents.QUEUE_UPDATE, listener);
  }

  onTaskProgress(listener: (payload: TaskProgressPayload) => void): this {
    return this.on(TaskEvents.TASK_PROGRESS, listener);
  }

  onTaskCompleted(listener: (payload: TaskCompletedPayload) => void): this {
    return this.on(TaskEvents.TASK_COMPLETED, listener);
  }
}

export const taskEvents = new TaskEventEmitter();
