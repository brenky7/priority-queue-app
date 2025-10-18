// frontend/src/components/TaskForm.tsx
import { useState } from "react";
import { apiClient } from "../services/api";

interface TaskFormProps {
  onError: (message: string) => void;
}

export function TaskForm({ onError }: TaskFormProps) {
  const [taskName, setTaskName] = useState<string>("");
  const [taskPriority, setTaskPriority] = useState<number>(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) {
      onError("Názov úlohy nemôže byť prázdny.");
      return;
    }

    try {
      await apiClient.addTask(taskName, taskPriority);
      setTaskName("");
      setTaskPriority(1);
    } catch (err: unknown) {
      onError(
        err instanceof Error ? err.message : "Nepodarilo sa pridať úlohu."
      ); // <-- Lokalizované a bezpečné
      console.error("Error adding task:", err);
    }
  };

  return (
    <div className="add-task-section">
      <h2>Pridať novú úlohu:</h2> {}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Názov úlohy"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Priorita"
          value={taskPriority}
          onChange={(e) => setTaskPriority(parseInt(e.target.value, 10))}
          min="0"
          required
        />
        <button type="submit">Pridať úlohu</button> {}
      </form>
    </div>
  );
}
