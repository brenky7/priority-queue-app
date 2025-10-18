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

    listenersRef.current.onConnect = () => {
      console.info("useRealtimeQueue: Úspešne pripojený k serveru!");
      setIsConnected(true);
      setReconnectAttempt(0);
      setLoading(false);
      setErrorMessage(null);
      socketClient.joinQueue();
    };
    socketClient.onConnect(listenersRef.current.onConnect);

    listenersRef.current.onQueueUpdate = (payload: QueueUpdatePayload) => {
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
    socketClient.onQueueUpdate(listenersRef.current.onQueueUpdate);

    listenersRef.current.onTaskProgress = (payload: TaskProgressPayload) => {
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
    socketClient.onTaskProgress(listenersRef.current.onTaskProgress);

    listenersRef.current.onTaskCompleted = (payload: TaskCompletedPayload) => {
      console.info("useRealtimeQueue: Úloha dokončená:", payload);
    };
    socketClient.onTaskCompleted(listenersRef.current.onTaskCompleted);

    listenersRef.current.onDisconnect = (reason: Socket.DisconnectReason) => {
      console.info("useRealtimeQueue: Odpojený od servera. Dôvod:", reason);
      setLoading(true);
      setIsConnected(false);
      displayTempError(
        "Odpojený od real-time servera. Pokúšam sa o opätovné pripojenie...",
        0
      );
    };
    socketClient.onDisconnect(listenersRef.current.onDisconnect);

    listenersRef.current.onConnectError = (err: Error) => {
      console.error("useRealtimeQueue: Chyba pripojenia:", err.message);
      displayTempError(
        `Chyba pripojenia k real-time serveru: ${err.message}`,
        0
      );
      setLoading(false);
      setIsConnected(false);
    };
    socketClient.onConnectError(listenersRef.current.onConnectError);

    listenersRef.current.onReconnecting = (attempt: number) => {
      console.info(
        `useRealtimeQueue: Pokus o opätovné pripojenie... (${attempt})`
      );
      setReconnectAttempt(attempt);
      setLoading(true);
      displayTempError(`Pokus o opätovné pripojenie (${attempt})...`, 0);
    };
    socketClient.onReconnecting(listenersRef.current.onReconnecting);

    listenersRef.current.onReconnect = (attempt: number) => {
      console.info(
        `useRealtimeQueue: Úspešné opätovné pripojenie! Po pokusoch: ${attempt}`
      );
      window.location.reload();
    };
    socketClient.onReconnect(listenersRef.current.onReconnect);

    // Odpojenie a čistenie
    return () => {
      console.info("useRealtimeQueue: Odpojujem sa z komponentu.");
      socketClient.offConnect(listenersRef.current.onConnect!);
      socketClient.offQueueUpdate(listenersRef.current.onQueueUpdate!);
      socketClient.offTaskProgress(listenersRef.current.onTaskProgress!);
      socketClient.offTaskCompleted(listenersRef.current.onTaskCompleted!);
      socketClient.offDisconnect(listenersRef.current.onDisconnect!);
      socketClient.offConnectError(listenersRef.current.onConnectError!);
      socketClient.offReconnecting(listenersRef.current.onReconnecting!);
      socketClient.offReconnect(listenersRef.current.onReconnect!);
    };
  }, [displayTempError]);

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
