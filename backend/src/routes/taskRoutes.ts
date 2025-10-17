import { Router } from "express";
import {
  addTaskController,
  getTasksController,
  getCompletedTasksController,
  clearCompletedTasksController,
} from "../controllers/taskController";
import { addTaskRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// GET /api/tasks - Získa všetky aktívne úlohy
router.get("/tasks", getTasksController);

// POST /api/tasks - Pridá novú úlohu
router.post("/tasks", addTaskRateLimiter, addTaskController);

// GET /api/tasks/completed - Získa všetky dokončené úlohy
router.get("/tasks/completed", getCompletedTasksController);

// DELETE /api/tasks/completed - Vymaže všetky dokončené úlohy
router.delete("/tasks/completed", clearCompletedTasksController);

export default router;
