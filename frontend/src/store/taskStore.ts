import { create } from "zustand";
import type { Task } from "../types/Task";

interface TaskState {
  activeTasks: Task[];
  completedTasks: Task[];
  currentlyProcessingTask: Task | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveTasks: (tasks: Task[]) => void;
  setCompletedTasks: (tasks: Task[]) => void;
  setCurrentlyProcessingTask: (task: Task | null) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  addTask: (name: string, priority: number) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  activeTasks: [],
  completedTasks: [],
  currentlyProcessingTask: null,
  isLoading: false,
  error: null,

  setActiveTasks: (tasks) => set({ activeTasks: tasks }),
  setCompletedTasks: (tasks) => set({ completedTasks: tasks }),
  setCurrentlyProcessingTask: (task) => set({ currentlyProcessingTask: task }),

  updateTaskProgress: (taskId, progress) => {
    set((state) => {
      // Update active tasks
      const updatedActiveTasks = state.activeTasks.map((task) =>
        task.id === taskId ? { ...task, progress } : task
      );

      // Update currently processing task if it's the one that changed
      const updatedCurrentTask =
        state.currentlyProcessingTask?.id === taskId
          ? { ...state.currentlyProcessingTask, progress }
          : state.currentlyProcessingTask;

      return {
        activeTasks: updatedActiveTasks,
        currentlyProcessingTask: updatedCurrentTask,
      };
    });
  },

  addTask: async (name, priority) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("http://localhost:5050/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, priority }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      // State will be updated via websocket
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCompletedTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        "http://localhost:5050/api/tasks/completed",
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to clear completed tasks");
      }

      // State will be updated via websocket
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
