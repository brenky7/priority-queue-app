import { useState, useEffect, useCallback } from "react";
import type { Task, CompletedTask } from "../types/Task";
import type {
  QueueUpdatePayload,
  TaskProgressPayload,
  TaskCompletedPayload,
} from "../types/socketTypes";
import { socketClient } from "../services/socket";

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
    socketClient.connect();
    console.info("useRealtimeQueue: Pokúšam sa pripojiť k serveru...");

    socketClient.onConnect(() => {
      console.info("useRealtimeQueue: Úspešne pripojený k serveru!");
      socketClient.joinQueue();
    });

    socketClient.onQueueUpdate((payload: QueueUpdatePayload) => {
      console.info("useRealtimeQueue: Prijatá aktualizácia fronty:", payload);
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

    socketClient.onTaskProgress((payload: TaskProgressPayload) => {
      console.info("useRealtimeQueue: Prijatý progres úlohy:", payload);
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

    socketClient.onTaskCompleted((payload: TaskCompletedPayload) => {
      console.info("useRealtimeQueue: Úloha dokončená:", payload);
    });

    socketClient.onDisconnect((reason) => {
      console.info("useRealtimeQueue: Odpojený od servera. Dôvod:", reason);
      setLoading(true);
      displayTempError(
        "Odpojený od real-time servera. Pokúšam sa o opätovné pripojenie..."
      );
    });

    socketClient.onConnectError((err) => {
      console.error("useRealtimeQueue: Chyba pripojenia:", err.message);
      displayTempError(`Chyba pripojenia k real-time serveru: ${err.message}`);
      setLoading(false);
    });

    // Odpojenie a čistenie
    return () => {
      console.info("useRealtimeQueue: Odpojujem sa z komponentu.");
      socketClient.removeAllListeners();
      socketClient.disconnect();
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
