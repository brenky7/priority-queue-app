import { apiClient } from "./services/api";
import "./App.css";
import { useRealtimeQueue } from "./hooks/useRealTimeQueue";
import { TaskForm } from "./components/taskForm";

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

  // Handler pre vymazanie dokončených úloh
  const handleClearCompletedTasks = async () => {
    try {
      await apiClient.clearCompletedTasks();
      console.info("Dokončené úlohy vymazané cez REST.");
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
      {/* ZMENA TU: Používame nový TaskForm komponent */}
      <TaskForm onError={displayTempError} />{" "}
      {/* Odovzdávame onError callback */}
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
              <p>Dokončené: {new Date(task.completedAt!).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
