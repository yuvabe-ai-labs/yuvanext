import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    // Get your backend URL from environment or config
    this.url = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ["websocket", "polling"],
        withCredentials: true, // Important for auth cookies
        autoConnect: true,
      });

      this.socket.on("connect", () => {
        console.log("✅ Socket connected:", this.socket?.id);
      });

      this.socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      this.socket.on("connect_error", (error) => {
        console.error("🔴 Connection error:", error);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
