// frontend/src/services/api.ts
import type { Task, CompletedTask } from "../types/Task";
interface ApiError {
  message: string;
  errors?: Array<{ path: string; message: string }>;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api"; // <-- UPRAVENÉ NA SPRÁVNY PORT
  }

  // Spracovanie odpovedí z API
  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      if (response.status === 204) {
        return undefined as T;
      }
      return response.json() as Promise<T>;
    }

    const contentType = response.headers.get("content-type");
    let errorMessage = `Server error (status ${response.status}).`; // Základná chybová správa

    // Parsovanie odpovede
    if (contentType?.includes("application/json")) {
      try {
        const errorData = (await response.json()) as ApiError;
        errorMessage = errorData.message || errorMessage;
      } catch (e: unknown) {
        // Chyba pri parsovaní JSON
        errorMessage = `Server error (JSON parsing failed, status ${response.status}).`;
        console.error("JSON parsing error:", e);
      }
    } else {
      // Odpoveď nie je JSON
      try {
        const text = await response.text();
        errorMessage = text || errorMessage;
      } catch (e: unknown) {
        // Chyba pri čítaní textu
        errorMessage = `Server error (text reading failed, status ${response.status}).`;
        console.error("Text reading error:", e);
      }
    }

    throw new Error(errorMessage);
  }

  async getActiveTasks(): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/tasks`);
    return this.handleResponse<Task[]>(response);
  }

  async getCompletedTasks(): Promise<CompletedTask[]> {
    const response = await fetch(`${this.baseUrl}/tasks/completed`);
    return this.handleResponse<CompletedTask[]>(response);
  }

  async addTask(name: string, priority: number): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, priority }),
    });
    return this.handleResponse<Task>(response);
  }

  async clearCompletedTasks(): Promise<void> {
    const response = await await fetch(`${this.baseUrl}/tasks/completed`, {
      method: "DELETE",
    });

    return this.handleResponse<void>(response);
  }
}

export const apiClient = new ApiClient();
