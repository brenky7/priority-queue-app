import { io, type Socket } from "socket.io-client";
import type {
  QueueUpdatePayload,
  TaskProgressPayload,
  TaskCompletedPayload,
} from "../types/socketTypes";

class SocketClient {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor() {
    this.serverUrl =
      import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:5050";
  }

  // Pripojí sa k Socket.IO serveru a vráti socket inštanciu.
  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ["websocket", "polling"],
        autoConnect: false,
      });
      this.socket.connect();
    } else if (!this.socket.connected) {
      this.socket.connect();
    }
    return this.socket;
  }

  // Odpojí sa od Socket.IO serveru.
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Metódy pre registráciu listenerov
  onConnect(callback: () => void): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("connect", callback);
  }

  onDisconnect(callback: (reason: Socket.DisconnectReason) => void): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("disconnect", callback);
  }

  onConnectError(callback: (error: Error) => void): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("connect_error", callback);
  }

  // Pripojí sa k frontu
  joinQueue(): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit("join_queue");
  }

  // Listenery pre udalosti zo servera
  onQueueUpdate(callback: (data: QueueUpdatePayload) => void): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("queue_update", callback);
  }

  onTaskProgress(callback: (data: TaskProgressPayload) => void): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("task_progress", callback);
  }

  onTaskCompleted(callback: (data: TaskCompletedPayload) => void): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("task_completed", callback);
  }

  // Odstráni všetky listenery
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketClient = new SocketClient();
