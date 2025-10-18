import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes";
import { environment } from "./config/environment";
import { globalErrorHandler } from "./middleware/errorHandler";
import { taskEvents, TaskEvents } from "./events/taskEventEmitter";
import type {
  QueueUpdatePayload,
  TaskProgressPayload,
  TaskCompletedPayload,
} from "./models/taskEventTypes";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { info as logInfo, debug as logDebug } from "./utils/logger";
import { taskService } from "./services/taskService";

const app = express();
const PORT = environment.port;
app.set("trust proxy", true);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: environment.frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: environment.frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", taskRoutes);
app.use(globalErrorHandler);

// Socket.IO setup
io.on("connection", (socket: Socket) => {
  logInfo(`Client connected: ${socket.id}`);

  // Event: client -> server 'join_queue'
  socket.on("join_queue", () => {
    logDebug(`Client ${socket.id} joined queue monitoring.`);
    socket.emit(TaskEvents.QUEUE_UPDATE, {
      activeTasks: taskService.getTasks(),
      completedTasks: taskService.getCompletedTasks(),
      currentlyProcessingTask: taskService.getCurrentlyProcessingTask(),
    } as QueueUpdatePayload);
  });

  socket.on("disconnect", () => {
    logInfo(`Client disconnected: ${socket.id}`);
  });
});

// Task update notifications
taskEvents.onQueueUpdate((payload: QueueUpdatePayload) => {
  io.emit(TaskEvents.QUEUE_UPDATE, payload);
  logDebug("Socket.IO: Emitting queue_update event from taskEvents.");
});

taskEvents.onTaskProgress((payload: TaskProgressPayload) => {
  io.emit(TaskEvents.TASK_PROGRESS, payload);
  logDebug(
    `Socket.IO: Emitting task_progress for ${payload.taskId} (${payload.progress}%).`
  );
});

taskEvents.onTaskCompleted((payload: TaskCompletedPayload) => {
  io.emit(TaskEvents.TASK_COMPLETED, payload);
  logDebug(`Socket.IO: Emitting task_completed for ${payload.task.id}.`);
});

// Spustenie HTTP/Socket.IO servera
httpServer.listen(PORT, () => {
  logInfo(`Server is running on http://localhost:${PORT}`);
  logInfo(`Socket.IO server is listening on ws://localhost:${PORT}`);
  logInfo("Pre ukončenie stlačte CTRL-C");
});

// Graceful shutdown
const gracefulShutdown = () => {
  logInfo("Server je vypínaný...");
  taskService.stopProcessing();
  io.disconnectSockets(true);
  httpServer.close(() => {
    logInfo("HTTP server shut down.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
