// src/App.tsx
import { useState } from "react";
import {
  addTask as addApiTask,
  clearCompletedTasks as clearApiCompletedTasks,
} from "./services/api";
import "./App.css";
import { useRealtimeQueue } from "./hooks/useRealTimeQueue";

function App() {
  // Hook pre správu fronty
  const {
    activeTasks,
    completedTasks,
    currentlyProcessingTask,
    loading,
    errorMessage,
    displayTempError,
  } = useRealtimeQueue();

  // Stavy pre novú úlohu
  const [newTaskName, setNewTaskName] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<number>(1);

  // Handler pre pridanie novej úlohy
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskName.trim()) {
      displayTempError("Názov úlohy nemôže byť prázdny.");
      return;
    }

    try {
      const addedTask = await addApiTask(newTaskName, newTaskPriority);
      console.log("Úloha pridaná cez REST:", addedTask);
      setNewTaskName("");
      setNewTaskPriority(1);
    } catch (err: unknown) {
      if (err instanceof Error) {
        displayTempError(err.message || "Nepodarilo sa pridať úlohu.");
        console.error("Chyba pri pridávaní úlohy:", err.message);
      } else {
        displayTempError("Nepodarilo sa pridať úlohu (neznáma chyba).");
        console.error("Neznáma chyba pri pridávaní úlohy:", err);
      }
    }
  };

  // Handler pre vymazanie dokončených úloh
  const handleClearCompletedTasks = async () => {
    try {
      await clearApiCompletedTasks();
      console.log("Dokončené úlohy vymazané cez REST.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        displayTempError(
          err.message || "Nepodarilo sa vymazať dokončené úlohy."
        );
        console.error("Chyba pri mazaní dokončených úloh:", err.message);
      } else {
        displayTempError(
          "Nepodarilo sa vymazať dokončené úlohy (neznáma chyba)."
        );
        console.error("Neznáma chyba pri mazaní dokončených úloh:", err);
      }
    }
  };

  // UI Renderovanie
  return (
    <div className="task-queue-monitor">
      <h1>Task Queue Monitor</h1>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {loading && <p>Pripájam sa a načítavam úlohy...</p>}

      <div className="add-task-section">
        <h2>Pridať novú úlohu:</h2>
        <form onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Názov úlohy"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Priorita"
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(parseInt(e.target.value, 10))}
            min="0"
            required
          />
          <button type="submit">Pridať úlohu</button>
        </form>
      </div>

      <div className="queue-sections">
        <div className="active-tasks-section">
          <h2>Aktívne úlohy (podľa priority):</h2>
          {activeTasks.length === 0 && !loading && !errorMessage && (
            <p>Žiadne aktívne úlohy.</p>
          )}
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${
                currentlyProcessingTask?.id === task.id ? "processing" : ""
              }`}
            >
              <h3>{task.name}</h3>
              <p>ID: {task.id}</p>
              <p>Priorita: {task.priority}</p>
              <p>Progres: {task.progress}%</p>
              <p>Vytvorené: {new Date(task.createdAt).toLocaleString()}</p>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="completed-tasks-section">
          <h2>Dokončené úlohy:</h2>
          <button
            onClick={handleClearCompletedTasks}
            disabled={completedTasks.length === 0}
          >
            Vymazať dokončené
          </button>
          {completedTasks.length === 0 && !loading && !errorMessage && (
            <p>Žiadne dokončené úlohy.</p>
          )}
          {completedTasks.map((task) => (
            <div key={task.id} className="task-item completed">
              <h3>{task.name}</h3>
              <p>ID: {task.id}</p>
              <p>Priorita: {task.priority}</p>
              <p>Progres: {task.progress}%</p>
              <p>
                Dokončené: {new Date(task.completedAt!).toLocaleString()}
              </p>{" "}
              {}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
