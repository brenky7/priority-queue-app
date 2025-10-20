import { useState, useEffect, useCallback, useRef } from "react";
import type { Task, CompletedTask } from "../types/Task";
import type {
  QueueUpdatePayload,
  TaskProgressPayload,
  TaskCompletedPayload,
} from "../types/socketTypes";
import { socketClient } from "../services/socket";
import type { Socket } from "socket.io-client";

// Návratový typ
interface UseRealtimeQueueResult {
  activeTasks: Task[];
  completedTasks: CompletedTask[];
  currentlyProcessingTask: Task | null;
  loading: boolean;
  errorMessage: string | null;
  displayTempError: (message: string, duration?: number) => void;
  isConnected: boolean;
  reconnectAttempt: number;
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);

  // Zobrazenie chyby
  const displayTempError = useCallback(
    (message: string, duration: number | null = 5000) => {
      setErrorMessage(message);
      if (duration !== null && duration > 0) {
        const timer = setTimeout(() => {
          setErrorMessage(null);
        }, duration);
        return () => clearTimeout(timer);
      }
      return () => {};
    },
    []
  );

  // Referencia na listenerov
  const listenersRef = useRef<{
    onConnect?: () => void;
    onQueueUpdate?: (payload: QueueUpdatePayload) => void;
    onTaskProgress?: (payload: TaskProgressPayload) => void;
    onTaskCompleted?: (payload: TaskCompletedPayload) => void;
    onDisconnect?: (reason: Socket.DisconnectReason) => void;
    onConnectError?: (error: Error) => void;
    onReconnecting?: (attempt: number) => void;
    onReconnect?: (attempt: number) => void;
  }>({});

  // Spracovanie socket udalostí
  useEffect(() => {
    socketClient.connect();
    console.info("useRealtimeQueue: Pokúšam sa pripojiť k serveru...");

    // Create local copies of the listeners for use in both setup and cleanup
    const onConnect = () => {
      console.info("useRealtimeQueue: Úspešne pripojený k serveru!");
      setIsConnected(true);
      setReconnectAttempt(0);
      setLoading(false);
      setErrorMessage(null);
      socketClient.joinQueue();
    };

    const onQueueUpdate = (payload: QueueUpdatePayload) => {
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
    };

    const onTaskProgress = (payload: TaskProgressPayload) => {
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
    };

    const onTaskCompleted = (payload: TaskCompletedPayload) => {
      console.info("useRealtimeQueue: Úloha dokončená:", payload);
    };

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      console.info("useRealtimeQueue: Odpojený od servera. Dôvod:", reason);
      setLoading(true);
      setIsConnected(false);
      displayTempError(
        "Odpojený od real-time servera. Pokúšam sa o opätovné pripojenie...",
        0
      );
    };

    const onConnectError = (err: Error) => {
      console.error("useRealtimeQueue: Chyba pripojenia:", err.message);
      displayTempError(
        `Chyba pripojenia k real-time serveru: ${err.message}`,
        0
      );
      setLoading(false);
      setIsConnected(false);
    };

    const onReconnecting = (attempt: number) => {
      console.info(
        `useRealtimeQueue: Pokus o opätovné pripojenie... (${attempt})`
      );
      setReconnectAttempt(attempt);
      setLoading(true);
      displayTempError(`Pokus o opätovné pripojenie (${attempt})...`, 0);
    };

    const onReconnect = (attempt: number) => {
      console.info(
        `useRealtimeQueue: Úspešné opätovné pripojenie! Po pokusoch: ${attempt}`
      );
      window.location.reload();
    };

    // Store listeners in ref for potential use elsewhere
    listenersRef.current = {
      onConnect,
      onQueueUpdate,
      onTaskProgress,
      onTaskCompleted,
      onDisconnect,
      onConnectError,
      onReconnecting,
      onReconnect,
    };

    // Register event listeners using the local variables
    socketClient.onConnect(onConnect);
    socketClient.onQueueUpdate(onQueueUpdate);
    socketClient.onTaskProgress(onTaskProgress);
    socketClient.onTaskCompleted(onTaskCompleted);
    socketClient.onDisconnect(onDisconnect);
    socketClient.onConnectError(onConnectError);
    socketClient.onReconnecting(onReconnecting);
    socketClient.onReconnect(onReconnect);

    // Odpojenie a čistenie - use the same local variables for cleanup
    return () => {
      console.info("useRealtimeQueue: Odpojujem sa z komponentu.");
      socketClient.offConnect(onConnect);
      socketClient.offQueueUpdate(onQueueUpdate);
      socketClient.offTaskProgress(onTaskProgress);
      socketClient.offTaskCompleted(onTaskCompleted);
      socketClient.offDisconnect(onDisconnect);
      socketClient.offConnectError(onConnectError);
      socketClient.offReconnecting(onReconnecting);
      socketClient.offReconnect(onReconnect);
    };
  }, [displayTempError]); // displayTempError is the only dependency

  return {
    activeTasks,
    completedTasks,
    currentlyProcessingTask,
    loading,
    errorMessage,
    displayTempError,
    isConnected,
    reconnectAttempt,
  };
}
