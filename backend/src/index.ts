import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes";
import dotenv from "dotenv";
import { error as logError, info as logInfo } from "./utils/logger";
import * as taskService from "./services/taskService"; // Import taskService

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api", taskRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logError(`Caught an error: ${err.message}`, err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Interná chyba servera.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Spustenie
app.listen(PORT, () => {
  logInfo(`Server is running on http://localhost:${PORT}`); // Logovanie cez náš logger
  logInfo("Pre ukončenie stlačte CTRL-C");
});

taskService.startProcessing();

// Graceful shutdown
const gracefulShutdown = () => {
  logInfo("Server sa vypína.");
  taskService.stopProcessing();
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
