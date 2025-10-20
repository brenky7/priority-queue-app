import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { useTaskStore } from "../store/taskStore";

const SOCKET_URL = "http://localhost:5050";

export const useSocket = () => {
  const {
    setActiveTasks,
    setCompletedTasks,
    setCurrentlyProcessingTask,
    updateTaskProgress,
  } = useTaskStore();

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.info("Connected to socket server");
      socket.emit("join_queue");
    });

    socket.on("queue_update", (data) => {
      setActiveTasks(data.activeTasks);
      setCompletedTasks(data.completedTasks);
      setCurrentlyProcessingTask(data.currentlyProcessingTask);
    });

    socket.on("task_progress", (data) => {
      updateTaskProgress(data.taskId, data.progress);
    });

    socket.on("task_completed", () => {
      // The next queue_update event will refresh our state
    });

    socket.on("disconnect", () => {
      console.info("Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [
    setActiveTasks,
    setCompletedTasks,
    setCurrentlyProcessingTask,
    updateTaskProgress,
  ]);
};
