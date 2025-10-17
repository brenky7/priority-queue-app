import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {
  error as logError,
  info as logInfo,
  debug as logDebug,
} from "./utils/logger";
import * as taskService from "./services/taskService"; // Import taskService

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
app.set("trust proxy", true);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", taskRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logError(`Caught an error: ${err.message}`, err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Interná chyba servera.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Socket.IO setup
io.on("connection", (socket: Socket) => {
  logInfo(`Client connected: ${socket.id}`);

  // Event: client -> server 'join_queue'
  socket.on("join_queue", () => {
    logDebug(`Client ${socket.id} joined queue monitoring.`);
    socket.emit("queue_update", {
      activeTasks: taskService.getTasks(),
      completedTasks: taskService.getCompletedTasks(),
      currentlyProcessingTask: taskService.getCurrentlyProcessingTask(),
    });
  });

  socket.on("disconnect", () => {
    logInfo(`Client disconnected: ${socket.id}`);
  });
});

// Task update notifications
taskService.setQueueUpdateCallback(
  (activeTasks, completedTasks, currentlyProcessingTask) => {
    io.emit("queue_update", {
      activeTasks,
      completedTasks,
      currentlyProcessingTask,
    });
    logDebug("Socket.IO: Emitting queue_update event.");
  }
);

taskService.setTaskProgressCallback((taskId, progress) => {
  io.emit("task_progress", { taskId, progress });
  logDebug(`Socket.IO: Emitting task_progress for ${taskId} (${progress}%).`);
});

taskService.setTaskCompletedCallback((task) => {
  io.emit("task_completed", { task });
  logDebug(`Socket.IO: Emitting task_completed for ${task.id}.`);
});

// Spustenie HTTP/Socket.IO servera
httpServer.listen(PORT, () => {
  // ZMENA: Namiesto app.listen používame httpServer.listen
  logInfo(`Server is running on http://localhost:${PORT}`);
  logInfo(`Socket.IO server is listening on ws://localhost:${PORT}`);
  logInfo("Pre ukončenie stlačte CTRL-C");
});

taskService.startProcessing();

// Graceful shutdown
const gracefulShutdown = () => {
  logInfo("Server je vypínaný...");
  taskService.stopProcessing(); // Zastav spracovanie úloh
  io.disconnectSockets(true); // Odpoj všetkých Socket.IO klientov
  httpServer.close(() => {
    logInfo("HTTP server shut down.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
