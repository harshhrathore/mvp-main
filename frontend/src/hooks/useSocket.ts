import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Don't connect if no token
    if (!token) return;

    // Allow disabling socket via environment variable
    if (import.meta.env.VITE_ENABLE_SOCKET === "false") {
      console.log("Socket connection disabled via environment variable");
      return;
    }

    const socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: {
          token: token,
        },
        // Reduce reconnection attempts to avoid console spam
        reconnectionAttempts: 2,
        reconnectionDelay: 10000, // Wait 10s between attempts
        reconnectionDelayMax: 10000,
        timeout: 5000,
        autoConnect: true,
        // Try websocket first, then polling
        transports: ["websocket", "polling"],
      },
    );

    let hasLoggedError = false;

    socketInstance.on("connect", () => {
      console.log("✓ Socket connected");
      setIsConnected(true);
      hasLoggedError = false;
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      if (!hasLoggedError) {
        console.warn(
          "⚠ Socket connection failed. Real-time features disabled. Start backend: cd new_backend && npm run dev",
        );
        hasLoggedError = true;
      }
      setIsConnected(false);
    });

    socketInstance.on("reconnect_failed", () => {
      console.warn("Socket reconnection failed. Backend may not be running.");
      socketInstance.disconnect();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
