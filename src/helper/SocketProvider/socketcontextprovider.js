// src/helper/SocketProvider/socketcontextprovider.js
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

// module-level shared instance
let sharedSocket = null;
let isInitializing = false;

export function SocketProvider({ children }) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // If not authenticated, tear down existing socket
    if (status !== "authenticated" || !session?.user) {
      if (sharedSocket) {
        sharedSocket.off();
        sharedSocket.disconnect();
        sharedSocket = null;
      }
      setSocket(null);
      return;
    }

    // Already have a live socket: reuse it
    if (sharedSocket && sharedSocket.connected) {
      setSocket(sharedSocket);
      return;
    }

    // Prevent racing creation
    if (isInitializing) {
      return;
    }
    isInitializing = true;

    const userId = session.user.id || session.user.email;
    const username =
      session.user.username || session.user.name || session.user.email || "Guest";

    const socketInstance = io(window.location.origin, {
      path: "/api/socket",
      transports: ["websocket"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      socketInstance.emit("user-online", { userId, username });
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("⚠️ Socket connect_error (handled):", err?.message || err);
    });

    socketInstance.on("error", (err) => {
      console.warn("⚠️ Socket error (handled):", err);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    sharedSocket = socketInstance;
    setSocket(socketInstance);
    // reset initializing after a tick so future attempts can proceed if needed
    isInitializing = false;
  }, [session, status]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
