import { Task, CompletedTask } from "../models/task";
import { v4 as uuidv4 } from "uuid";
import { environment } from "../config/environment";
import { debug, info, warn } from "../utils/logger";

const TASK_PROCESS_INTERVAL_MS = environment.taskProcessIntervalMs;
const TASK_PROGRESS_INCREMENT_MIN = environment.taskProgressIncrementMin;
const TASK_PROGRESS_INCREMENT_MAX = environment.taskProgressIncrementMax;
const AGING_FACTOR = environment.agingFactor;

// In-memory úložisko pre úlohy
export const tasks = new Map<string, Task>();
export const completedTasks = new Map<string, Task>();

// Aktuálne spracovávaná úloha
let currentlyProcessingTask: Task | null = null;

// Callback typy pre notifikácie
type QueueUpdateCallback = (
  tasks: Task[],
  completedTasks: Task[],
  currentlyProcessingTask: Task | null
) => void;
type TaskProgressCallback = (taskId: string, progress: number) => void;
type TaskCompletedCallback = (task: Task) => void;

// Callback premenné
let onQueueUpdate: QueueUpdateCallback | null = null;
let onTaskProgress: TaskProgressCallback | null = null;
let onTaskCompleted: TaskCompletedCallback | null = null;

// Nastavenie callbackov pre notifikácie
export const setQueueUpdateCallback = (callback: QueueUpdateCallback) => {
  onQueueUpdate = callback;
};
export const setTaskProgressCallback = (callback: TaskProgressCallback) => {
  onTaskProgress = callback;
};
export const setTaskCompletedCallback = (callback: TaskCompletedCallback) => {
  onTaskCompleted = callback;
};

// Notifikačné funkcie
const notifyClients = () => {
  if (onQueueUpdate) {
    onQueueUpdate(getTasks(), getCompletedTasks(), currentlyProcessingTask);
    debug("Queue update notification sent.");
  }
};

const notifyTaskProgress = (taskId: string, progress: number) => {
  if (onTaskProgress) {
    onTaskProgress(taskId, progress);
    debug(`Task ${taskId} progress update notification sent: ${progress}%`);
  }
};

const notifyTaskCompleted = (task: Task) => {
  if (onTaskCompleted) {
    onTaskCompleted(task);
    info(`Task ${task.id} completed notification sent.`);
  }
};

// Výpočet efektívnej priority úlohy so starnutím
const calculateEffectivePriority = (task: Task): number => {
  if (task.progress === 100) return -1; // Dokončené úlohy
  const now = Date.now();
  const timeElapsedSeconds = Math.floor(
    (now - task.createdAt.getTime()) / 1000
  );
  const agingBonus = timeElapsedSeconds / AGING_FACTOR;
  debug(`Task ${task.id} aging bonus: ${agingBonus}`);
  return task.priority + agingBonus;
};

// Pridanie novej úlohy
export const addTask = (name: string, priority: number): Task => {
  const newTask: Task = {
    id: uuidv4(),
    name,
    priority,
    progress: 0,
    createdAt: new Date(),
  };
  tasks.set(newTask.id, newTask);
  info(
    `New task added: ${newTask.name} (ID: ${newTask.id}, Priority: ${newTask.priority})`
  );
  updateQueueState(); // Aktualizácia stavu fronty
  notifyClients(); // Oznámenie o zmene fronty
  return newTask;
};

// Získanie všetkých aktívnych úloh
export const getTasks = (): Task[] => {
  const activeTasks = Array.from(tasks.values()).filter(
    (task) => task.progress < 100
  );

  // Triedenie: podľa priority
  activeTasks.sort((a, b) => {
    const effectivePriorityA = calculateEffectivePriority(a);
    const effectivePriorityB = calculateEffectivePriority(b);
    return effectivePriorityB - effectivePriorityA;
  });

  return activeTasks;
};

// Získanie všetkých dokončených úloh
export const getCompletedTasks = (): Task[] => {
  return Array.from(tasks.values()).filter((task) => task.progress === 100);
};

// Vymazanie dokončených úloh
export const clearCompletedTasks = (): void => {
  const completedTaskIds = Array.from(tasks.values())
    .filter((task) => task.progress === 100)
    .map((task) => task.id);

  completedTaskIds.forEach((id) => tasks.delete(id));
  info(`Cleared ${completedTaskIds.length} completed tasks from main queue.`);
  notifyClients(); // Oznámenie o zmene fronty
};

// Aktualizácia stavu fronty a výber aktuálnej úlohy
export const updateQueueState = (): void => {
  const activeTasks = getTasks();

  // Skontroluj, či aktuálna úloha stále potrebuje spracovanie
  if (
    currentlyProcessingTask &&
    tasks.has(currentlyProcessingTask.id) &&
    tasks.get(currentlyProcessingTask.id)!.progress < 100 &&
    activeTasks[0] &&
    activeTasks[0].id === currentlyProcessingTask.id
  ) {
    debug(`Continuing task ${currentlyProcessingTask.id}`);
  } else {
    const oldCurrentlyProcessingTask = currentlyProcessingTask;
    currentlyProcessingTask = activeTasks[0] || null;

    if (oldCurrentlyProcessingTask?.id !== currentlyProcessingTask?.id) {
      info(
        `Switched currently processing task to: ${
          currentlyProcessingTask ? currentlyProcessingTask.name : "None"
        } (ID: ${currentlyProcessingTask?.id || "N/A"})`
      );
    } else {
      debug(
        `Currently processing task is still: ${
          currentlyProcessingTask ? currentlyProcessingTask.name : "None"
        }`
      );
    }
  }
};

// Export aktuálne spracovávanej úlohy
export const getCurrentlyProcessingTask = (): Task | null =>
  currentlyProcessingTask;

// Export funkcia pre simuláciu spracovania
export const processTasks = (): void => {
  debug("Running task processing cycle.");
  updateQueueState();

  if (!currentlyProcessingTask) {
    debug("No tasks to process.");
    return;
  }

  const task = tasks.get(currentlyProcessingTask.id);
  if (!task) {
    warn(
      `Currently processing task ${currentlyProcessingTask.id} not found in map.`
    );
    currentlyProcessingTask = null;
    notifyClients();
    return;
  }

  if (task.progress >= 100) {
    // Ak bola úloha už dokončená, ale ešte nebola updatovaná
    info(`Task ${task.id} was already completed.`);
    updateQueueState(); // Update stavu fronty
    return;
  }

  // Zvýšenie progresu
  const increment =
    Math.floor(
      Math.random() *
        (TASK_PROGRESS_INCREMENT_MAX - TASK_PROGRESS_INCREMENT_MIN + 1)
    ) + TASK_PROGRESS_INCREMENT_MIN;
  task.progress = Math.min(100, task.progress + increment);
  info(
    `Processing task ${task.id} (${task.name}): Progress changed to ${task.progress}%`
  );

  notifyTaskProgress(task.id, task.progress); // Oznámenie progresu

  // Úloha bola dokončená
  if (task.progress === 100) {
    info(`Task ${task.id} (${task.name}) completed.`);
    const completedTask: CompletedTask = {
      ...task,
      completedAt: new Date(),
    };

    tasks.set(completedTask.id, completedTask);
    notifyTaskCompleted(task); // Oznámenie dokončenia
    updateQueueState();
    notifyClients();
  } else {
    notifyClients();
  }
};

// Interval pre spracovanie úloh
let processingIntervalId: NodeJS.Timeout | null = null;

// Spustenie spracovania úloh
export const startProcessing = (): void => {
  if (!processingIntervalId) {
    processingIntervalId = setInterval(processTasks, TASK_PROCESS_INTERVAL_MS);
    info(
      `Task processing started with interval ${TASK_PROCESS_INTERVAL_MS}ms.`
    );
  }
};

// Zastavenie spracovania úloh
export const stopProcessing = (): void => {
  if (processingIntervalId) {
    clearInterval(processingIntervalId);
    processingIntervalId = null;
    info("Task processing stopped.");
  }
};

startProcessing();
