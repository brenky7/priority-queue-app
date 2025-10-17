import { useState, useEffect, useCallback } from "react";
import type { Task, CompletedTask } from "../types/Task";
import type {
  QueueUpdatePayload,
  TaskProgressPayload,
  TaskCompletedPayload,
} from "../types/socketTypes";
import socket from "../services/socket";

// Návratový typ
interface UseRealtimeQueueResult {
  activeTasks: Task[];
  completedTasks: CompletedTask[];
  currentlyProcessingTask: Task | null;
  loading: boolean;
  errorMessage: string | null;
  displayTempError: (message: string, duration?: number) => void;
}

// Správa fronty taskov
export function useRealtimeQueue(
  initialLoadingState: boolean = true
): UseRealtimeQueueResult {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [currentlyProcessingTask, setCurrentlyProcessingTask] =
    useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(initialLoadingState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Zobrazenie chyby
  const displayTempError = useCallback(
    (message: string, duration: number = 5000) => {
      setErrorMessage(message);
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, duration);
      return () => clearTimeout(timer); // Clean-up časovača
    },
    []
  );

  // Spracovanie socket udalostí
  useEffect(() => {
    socket.connect();
    console.log("useRealtimeQueue: Pokúšam sa pripojiť k serveru...");

    socket.on("connect", () => {
      console.log("useRealtimeQueue: Úspešne pripojený k serveru!");
      socket.emit("join_queue");
    });

    socket.on("queue_update", (payload: QueueUpdatePayload) => {
      console.log("useRealtimeQueue: Prijatá aktualizácia fronty:", payload);
      setActiveTasks(
        payload.activeTasks.filter((task) => task.progress < 100) as Task[]
      );
      setCompletedTasks(
        payload.completedTasks.filter(
          (task) => task.progress === 100
        ) as CompletedTask[]
      );
      setCurrentlyProcessingTask(payload.currentlyProcessingTask);
      setLoading(false);
      setErrorMessage(null);
    });

    socket.on("task_progress", (payload: TaskProgressPayload) => {
      console.log("useRealtimeQueue: Prijatý progres úlohy:", payload);
      setActiveTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === payload.taskId
            ? { ...task, progress: payload.progress }
            : task
        )
      );
      setCurrentlyProcessingTask((prevTask) =>
        prevTask && prevTask.id === payload.taskId
          ? { ...prevTask, progress: payload.progress }
          : prevTask
      );
    });

    socket.on("task_completed", (payload: TaskCompletedPayload) => {
      console.log("useRealtimeQueue: Úloha dokončená:", payload);
    });

    socket.on("disconnect", () => {
      console.log("useRealtimeQueue: Odpojený od servera.");
      setLoading(true);
      displayTempError(
        "Odpojený od real-time servera. Pokúšam sa o opätovné pripojenie..."
      );
    });

    socket.on("connect_error", (err) => {
      console.error("useRealtimeQueue: Chyba pripojenia:", err.message);
      displayTempError(`Chyba pripojenia k real-time serveru: ${err.message}`);
      setLoading(false);
    });

    // Odpojenie a čistenie
    return () => {
      console.log("useRealtimeQueue: Odpojujem sa z komponentu.");
      socket.offAny();
      socket.disconnect();
    };
  }, [displayTempError]);

  return {
    activeTasks,
    completedTasks,
    currentlyProcessingTask,
    loading,
    errorMessage,
    displayTempError,
  };
}
