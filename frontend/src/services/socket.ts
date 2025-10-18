import { io, type Socket } from "socket.io-client";
import type {
  QueueUpdatePayload,
  TaskProgressPayload,
  TaskCompletedPayload,
} from "../types/socketTypes";

class SocketClient {
  private socket: Socket | null = null;
  private serverUrl: string;
  private isManuallyDisconnected = false;

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
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });
      this.isManuallyDisconnected = false;
      this.socket.connect();
    } else if (!this.socket.connected && !this.isManuallyDisconnected) {
      this.socket.connect();
    }
    return this.socket;
  }

  // Odpojí sa od Socket.IO serveru.
  disconnectAndCleanUp(): void {
    if (this.socket) {
      this.isManuallyDisconnected = true;
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
    }
  }

  // Metódy pre registráciu listenerov
  onConnect(callback: () => void): void {
    this.socket?.on("connect", callback);
  }

  onDisconnect(callback: (reason: Socket.DisconnectReason) => void): void {
    this.socket?.on("disconnect", callback);
  }

  onReconnecting(callback: (attempt: number) => void): void {
    this.socket?.on("reconnecting", callback);
  }

  onConnectError(callback: (error: Error) => void): void {
    this.socket?.on("connect_error", callback);
  }

  onReconnect(callback: (attempt: number) => void): void {
    this.socket?.on("reconnect", callback);
  }

  // Pripojí sa k fronte úloh
  joinQueue(): void {
    this.socket?.emit("join_queue");
  }

  // Listenery pre udalosti zo servera
  onQueueUpdate(callback: (data: QueueUpdatePayload) => void): void {
    this.socket?.on("queue_update", callback);
  }

  onTaskProgress(callback: (data: TaskProgressPayload) => void): void {
    this.socket?.on("task_progress", callback);
  }

  onTaskCompleted(callback: (data: TaskCompletedPayload) => void): void {
    this.socket?.on("task_completed", callback);
  }

  // Metódy pre odstránenie listenerov
  offConnect(callback: () => void): void {
    this.socket?.off("connect", callback);
  }

  offDisconnect(callback: (reason: Socket.DisconnectReason) => void): void {
    this.socket?.off("disconnect", callback);
  }

  offReconnecting(callback: (attempt: number) => void): void {
    this.socket?.off("reconnecting", callback);
  }

  offConnectError(callback: (error: Error) => void): void {
    this.socket?.off("connect_error", callback);
  }

  offReconnect(callback: (attempt: number) => void): void {
    this.socket?.off("reconnect", callback);
  }

  offQueueUpdate(callback: (data: QueueUpdatePayload) => void): void {
    this.socket?.off("queue_update", callback);
  }

  offTaskProgress(callback: (data: TaskProgressPayload) => void): void {
    this.socket?.off("task_progress", callback);
  }

  offTaskCompleted(callback: (data: TaskCompletedPayload) => void): void {
    this.socket?.off("task_completed", callback);
  }

  // Odstráni všetky listenery
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketClient = new SocketClient();
