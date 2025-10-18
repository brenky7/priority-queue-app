import { Task, CompletedTask, TaskStatus } from "../models/task";
import { v4 as uuidv4 } from "uuid";
import { environment as envConfig } from "../config/environment";
import {
  debug as logDebug,
  info as logInfo,
  warn as logWarn,
} from "../utils/logger";
import { taskEvents } from "../events/taskEventEmitter";

// Trieda TaskService s dependency injection pre eventEmitter
export class TaskService {
  private tasks = new Map<string, Task | CompletedTask>(); // Interná mapa úloh
  private currentlyProcessingTask: Task | null = null; // Aktuálne spracovávaná úloha
  private processingIntervalId: NodeJS.Timeout | null = null; // ID intervalu

  // Dependency Injection pre eventEmitter (a logger, environment ak treba)
  constructor(private eventEmitter = taskEvents) {
    this.startProcessing(); // Automaticky spusti spracovanie úloh
    logInfo("TaskService initialized and processing started.");
  }

  // Pomocná funkcia pre notifikácie klientov
  private notifyClients(): void {
    this.eventEmitter.emitQueueUpdate(
      this.getTasks(),
      this.getCompletedTasks(),
      this.currentlyProcessingTask
    );
    logDebug("Queue update event emitted via TaskService.");
  }

  // Pomocná funkcia pre notifikáciu progresu
  private notifyTaskProgress(taskId: string, progress: number): void {
    this.eventEmitter.emitTaskProgress(taskId, progress);
    logDebug(`Task ${taskId} progress event emitted: ${progress}%`);
  }

  // Pomocná funkcia pre notifikáciu dokončenia úlohy
  private notifyTaskCompleted(task: CompletedTask): void {
    this.eventEmitter.emitTaskCompleted(task);
    logInfo(`Task ${task.id} completed event emitted.`);
  }

  // Výpočet efektívnej priority úlohy so starnutím
  private calculateEffectivePriority(task: Task): number {
    if (task.progress === 100) return -1;
    const now = Date.now();
    const timeElapsedSeconds = Math.floor(
      (now - task.createdAt.getTime()) / 1000
    );
    const agingBonus = timeElapsedSeconds / envConfig.agingFactor;
    logDebug(`Task ${task.id} aging bonus: ${agingBonus}`);
    return task.priority + agingBonus;
  }

  // Verejná metóda na pridanie novej úlohy
  public addTask(name: string, priority: number): Task {
    const newTask: Task = {
      id: uuidv4(),
      name,
      priority,
      progress: 0,
      createdAt: new Date(),
      status: TaskStatus.WAITING,
      effectivePriority: priority,
    };
    this.tasks.set(newTask.id, newTask);
    logInfo(
      `New task added: ${newTask.name} (ID: ${newTask.id}, Priority: ${newTask.priority})`
    );
    this.updateQueueState(); // Aktualizácia stavu fronty
    this.notifyClients(); // Oznámenie o zmene fronty
    return newTask;
  }

  // Verejná metóda na získanie všetkých aktívnych úloh (s progress < 100)
  public getTasks(): Task[] {
    const activeTasks = Array.from(this.tasks.values()).filter(
      (task): task is Task => task.progress < 100
    );

    // Triedenie: podľa efektívnej priority
    activeTasks.sort((a, b) => {
      a.effectivePriority = this.calculateEffectivePriority(a);
      b.effectivePriority = this.calculateEffectivePriority(b);
      return b.effectivePriority - a.effectivePriority;
    });

    return activeTasks;
  }

  // Verejná metóda na získanie všetkých dokončených úloh (s progress === 100)
  public getCompletedTasks(): CompletedTask[] {
    return Array.from(this.tasks.values()).filter(
      (task): task is CompletedTask => task.progress === 100
    );
  }

  // Verejná metóda na vymazanie dokončených úloh
  public clearCompletedTasks(): void {
    const completedTaskIds = Array.from(this.tasks.values())
      .filter((task) => task.progress === 100)
      .map((task) => task.id);

    completedTaskIds.forEach((id) => this.tasks.delete(id));
    logInfo(
      `Cleared ${completedTaskIds.length} completed tasks from main queue.`
    );
    this.notifyClients(); // Oznámenie o zmene fronty
  }

  // Interná metóda na aktualizáciu stavu fronty a výber aktuálnej úlohy
  private updateQueueState(): void {
    const activeTasks = this.getTasks(); // Získanie úloh

    // Logika pre výber aktuálne spracovávananej úlohy
    if (
      this.currentlyProcessingTask &&
      this.tasks.has(this.currentlyProcessingTask.id) &&
      (this.tasks.get(this.currentlyProcessingTask.id) as Task).progress <
        100 &&
      activeTasks[0] &&
      activeTasks[0].id === this.currentlyProcessingTask.id
    ) {
      // Pokračujeme v spracovaní existujúcej úlohy
      logDebug(`Continuing task ${this.currentlyProcessingTask.id}`);
      (this.tasks.get(this.currentlyProcessingTask.id) as Task).status =
        TaskStatus.PROCESSING;
    } else {
      // Úloha je dokončená, alebo žiadna nebola spracovávaná, alebo sa objavila úloha s vyššou prioritou
      const oldCurrentlyProcessingTask = this.currentlyProcessingTask;
      this.currentlyProcessingTask = activeTasks[0] || null;

      if (oldCurrentlyProcessingTask?.id !== this.currentlyProcessingTask?.id) {
        // Ak sa zmenila aktuálne spracovávaná úloha
        if (
          oldCurrentlyProcessingTask &&
          this.tasks.has(oldCurrentlyProcessingTask.id)
        ) {
          const oldTask = this.tasks.get(oldCurrentlyProcessingTask.id);
          if (oldTask && oldTask.progress < 100) {
            (oldTask as Task).status = TaskStatus.WAITING; // Ak nebola dokončená, vrátila sa do WAITING
          } else if (oldTask && oldTask.progress === 100) {
            (oldTask as CompletedTask).status = TaskStatus.COMPLETED; // Ak bola dokončená = COMPLETED
          }
        }
        if (
          this.currentlyProcessingTask &&
          this.tasks.has(this.currentlyProcessingTask.id)
        ) {
          // Nová aktuálna úloha sa označí ako PROCESSING
          (this.tasks.get(this.currentlyProcessingTask.id) as Task).status =
            TaskStatus.PROCESSING;
        }

        logInfo(
          `Switched currently processing task to: ${
            this.currentlyProcessingTask
              ? this.currentlyProcessingTask.name
              : "None"
          } (ID: ${this.currentlyProcessingTask?.id || "N/A"})`
        );
      } else if (this.currentlyProcessingTask) {
        // Ak sa úloha nezmenila, ale bola prvýkrát zvolená
        (this.tasks.get(this.currentlyProcessingTask.id) as Task).status =
          TaskStatus.PROCESSING;
        logDebug(
          `Currently processing task is still: ${
            this.currentlyProcessingTask
              ? this.currentlyProcessingTask.name
              : "None"
          }`
        );
      }
    }
  }

  // Verejná metóda na získanie aktuálne spracovávanej úlohy
  public getCurrentlyProcessingTask(): Task | null {
    return this.currentlyProcessingTask;
  }

  // Privátna metóda pre simuláciu spracovania úloh (spúšťaná intervalom)
  private processTasks(): void {
    logDebug("Running task processing cycle.");
    this.updateQueueState();

    if (!this.currentlyProcessingTask) {
      logDebug("No tasks to process.");
      return;
    }

    const task = this.tasks.get(this.currentlyProcessingTask.id);
    if (!task) {
      logWarn(
        `Currently processing task ${this.currentlyProcessingTask.id} not found in map.`
      );
      this.currentlyProcessingTask = null;
      this.notifyClients();
      return;
    }

    if (task.progress >= 100) {
      logInfo(`Task ${task.id} was already completed.`);
      this.notifyTaskCompleted(task as CompletedTask); // Už je to CompletedTask
      this.updateQueueState();
      this.notifyClients();
      return;
    }

    // Zvýšenie progresu
    const increment =
      Math.floor(
        Math.random() *
          (envConfig.taskProgressIncrementMax -
            envConfig.taskProgressIncrementMin +
            1)
      ) + envConfig.taskProgressIncrementMin;
    task.progress = Math.min(100, task.progress + increment);
    logInfo(
      `Processing task ${task.id} (${task.name}): Progress changed to ${task.progress}%`
    );

    this.notifyTaskProgress(task.id, task.progress); // Oznámenie progresu

    // Ak úloha dosiahla 100% progresu, je dokončená
    if (task.progress === 100) {
      logInfo(`Task ${task.id} (${task.name}) completed.`);
      const completedTask: CompletedTask = {
        ...task,
        completedAt: new Date(), // Pridaný dátum dokončenia
        status: TaskStatus.COMPLETED, // Nastavený status
      };
      this.tasks.set(completedTask.id, completedTask); // Aktualizácia úlohy v hlavnej mape
      this.notifyTaskCompleted(completedTask); // Oznámenie dokončenia
      this.updateQueueState();
      this.notifyClients(); // Oznámenie o zmene fronty
    } else {
      this.notifyClients(); // Oznámenie o zmene progresu (ak nie je 100%)
    }
  }

  // Verejná metóda na spustenie spracovania úloh
  public startProcessing(): void {
    if (!this.processingIntervalId) {
      this.processingIntervalId = setInterval(
        () => this.processTasks(),
        envConfig.taskProcessIntervalMs
      );
      logInfo(
        `Task processing started with interval ${envConfig.taskProcessIntervalMs}ms.`
      );
    }
  }

  // Verejná metóda na zastavenie spracovania úloh
  public stopProcessing(): void {
    if (this.processingIntervalId) {
      clearInterval(this.processingIntervalId);
      this.processingIntervalId = null;
      logInfo("Task processing stopped.");
    }
  }
}

// Singleton inštancia TaskService
export const taskService = new TaskService();
