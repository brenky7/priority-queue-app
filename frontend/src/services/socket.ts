import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3000";

// Vytvorenie Socket.IO klienta
const socket: Socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket", "polling"],
  autoConnect: false,
});

export default socket;
