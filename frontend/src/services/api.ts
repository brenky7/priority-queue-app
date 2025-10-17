import type { Task } from "../types/Task";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

// Funkcia na spracovanie odpovede z API
const handleResponse = async (response: Response) => {
  // Úspešná odpoveď
  if (response.ok) {
    return response.json();
  }

  // Chybná odpoveď
  let finalErrorMessage: string = `Chyba servera (status ${response.status}).`;
  const contentType = response.headers.get("content-type");

  // JSON odpoveď
  if (contentType && contentType.includes("application/json")) {
    try {
      const jsonResponse: unknown = await response.json();
      if (
        typeof jsonResponse === "object" &&
        jsonResponse !== null &&
        "message" in jsonResponse &&
        typeof (jsonResponse as { message: unknown }).message === "string"
      ) {
        finalErrorMessage = (jsonResponse as { message: string }).message;
      } else {
        finalErrorMessage = `Chyba servera (JSON odpoveď je neočakávaného formátu, status ${response.status}).`;
      }
    } catch (e) {
      finalErrorMessage = `Chyba servera (JSON parse zlyhal, status ${response.status}), ${e}.`;
    }
  } else {
    // Textová odpoveď
    try {
      const text = await response.text();
      finalErrorMessage = text || `Chyba servera (status ${response.status}).`;
    } catch (e) {
      finalErrorMessage = `Chyba servera (čítanie textu zlyhalo, status ${response.status}), ${e}.`;
    }
  }

  // Finálna chyba
  throw new Error(finalErrorMessage);
};

// Získa všetky aktívne úlohy
export const getActiveTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  return handleResponse(response);
};

// Získa všetky dokončené úlohy
export const getCompletedTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks/completed`);
  return handleResponse(response);
};

// Pridá novú úlohu
export const addTask = async (
  name: string,
  priority: number
): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, priority }),
  });
  return handleResponse(response);
};

// Vymaže dokončené úlohy
export const clearCompletedTasks = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/completed`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Chyba servera.");
  }
};
