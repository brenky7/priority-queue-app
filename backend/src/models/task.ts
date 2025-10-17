export interface Task {
  id: string;
  name: string;
  priority: number; // higher = more important
  progress: number; // 0-100 percentage
  createdAt: Date;
}

export interface CompletedTask extends Task {
  completedAt: Date;
}
