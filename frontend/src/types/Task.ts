export enum TaskStatus {
  WAITING = "WAITING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
}

export interface Task {
  id: string;
  name: string;
  priority: number; // higher = more important
  progress: number; // 0-100 percentage
  createdAt: string;

  // Pridané polia
  status: TaskStatus; // Aktuálny stav úlohy
  effectivePriority: number; // Priorita s agingom
}

export interface CompletedTask extends Task {
  completedAt: string;
}
