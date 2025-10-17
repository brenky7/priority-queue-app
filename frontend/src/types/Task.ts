export interface Task {
  id: string;
  name: string;
  priority: number; // higher = more important
  progress: number; // 0-100 percentage
  createdAt: string;
  completedAt?: string; // not in the assignment, I added this field to mark when the task was completed
}

export interface CompletedTask extends Task {
  completedAt: string;
}
