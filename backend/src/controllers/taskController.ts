import { Request, Response, NextFunction } from "express";
import { z } from "zod"; // Pre validáciu vstupov
import * as taskService from "../services/taskService";

// Schéma pre pridanie úlohy
const addTaskSchema = z.object({
  name: z.string().trim().min(1, "Názov úlohy je povinný."),
  priority: z
    .number()
    .int()
    .min(0, "Priorita musí byť kladné číslo alebo nula."),
});

// Handler pre POST /api/tasks
export const addTaskController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validácia vstupu
    const validatedData = addTaskSchema.parse(req.body);
    const { name, priority } = validatedData;

    const newTask = taskService.addTask(name, priority);
    res.status(201).json(newTask); // 201 Created
  } catch (error: unknown) {
    next(error);
  }
};

// Handler pre GET /api/tasks
export const getTasksController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tasks = taskService.getTasks();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// Handler pre GET /api/tasks/completed
export const getCompletedTasksController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const completedTasks = taskService.getCompletedTasks();
    res.status(200).json(completedTasks);
  } catch (error) {
    next(error);
  }
};

// Handler pre DELETE /api/tasks/completed
export const clearCompletedTasksController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    taskService.clearCompletedTasks();
    res.status(204).send(); // 204 No Content
  } catch (error) {
    next(error);
  }
};
